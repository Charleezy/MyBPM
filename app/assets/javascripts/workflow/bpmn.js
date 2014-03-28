// +--------------------------------------------------------------------+ \\
// Š BpmnJS 1.0 - BPMN2.0 rendering for JavaScript                      Š \\
// +--------------------------------------------------------------------Š \\
// Š Copyright © 2013 Wolfgang Pleus http://www.pleus.net)              Š \\
// +--------------------------------------------------------------------+ \\
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Requires
// MLXJS   - http://xmljs.sourceforge.net/
// Raphael - http://raphaeljs.com/


// Namespace
var net = net || {};
net = {};
var totalLanes = 0;
function assert(condition, message) {
  if (!condition) {
      throw message || "Assertion failed";
  }
}
        
// Constructor
net.BpmnJS = function(xpdlJson, canvas, isStatic){

  this.xpdlJson = xpdlJson;
  this.isStatic = isStatic;

  // CREATING RAPHAEL CANVAS
  this.paper = Raphael(canvas, canvas.clientWidth, canvas.clientHeight);
  this.connections = [];
  this.currentId = 0;
};

// Shared functions
net.BpmnJS.prototype = {

  // REPLACES A PROPERTY ON A TREE OF JAVASCRIPT OBJECTS
  replaceProperty: function(object, property, oldValue, newValue){

    // IF WE FOUND IT, JUST REPLACE
    if(object.hasOwnProperty(property) && object[property] === oldValue){
      object[property] = newValue;
      console.log('replaced');
    }

    // IF NOT, SEARCH ON THE OBJECTS INSIDE
    else{
      for(i in object){

        // IF THE PROPERTY IS AN OBJECT, SEARCH INSIDE IT
        if(object[i] instanceof Object){
          this.replaceProperty(object[i], property, oldValue, newValue);
        }

        // IF IT'S AN ARRAY, LOOP THROUGH IT'S ELEMENTS
        else if(object[i] instanceof Array){
          for(j in object[i]){
            this.replaceProperty(object[i][j], property, oldValue, newValue);
          }
        }
      }
    }
  },

  plot: function(){
    console.log(XpdlJsonGenerator.getNewWorkflowJson('test'));
    
    // PAINT
    for(var i=0; i<this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess.length; i++){

      // ACTIVITIES
      if(this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Activities')){
        var activities = this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].Activities.Activity;
        for(var j=0; j<activities.length; j++){
          var activity = activities[j];
          var temporaryId = activity.Id;
          this.replaceProperty(this.xpdlJson, 'Id', temporaryId, String(this.currentId));
          this.replaceProperty(this.xpdlJson, 'From', temporaryId, String(this.currentId));
          this.replaceProperty(this.xpdlJson, 'To', temporaryId, String(this.currentId));
          this.currentId++;
          console.log('newId: ' + activity.Id);
          var xCoordinate = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.XCoordinate);
          var yCoordinate = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.YCoordinate);
          var height = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Height);
          var width = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Width);
          var borderColor = activity.NodeGraphicsInfos.NodeGraphicsInfo.BorderColor;
          var fillColor = activity.NodeGraphicsInfos.NodeGraphicsInfo.FillColor;
          var name = activity.Name;
          this.paintActivity(activity, xCoordinate, yCoordinate, height, width, borderColor, fillColor, name);
        }
      }
    }

    // PAINT
    for(var i=0; i<this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess.length; i++){
      
      // TRANSITIONS
      if(this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Transitions')){
        var transitions = this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].Transitions.Transition,
            me = this;
        transitions.forEach(function(transition) {

          me.replaceProperty(me.xpdlJson, 'Id', transition.Id, String(me.currentId));
          me.currentId++;
          // Reference the activities we're transitioning to/from.
          var element1 = me.getById(transition.From);
          var element2 = me.getById(transition.To);

          // Create link association between the two activities.
          me.connectElements(element1, element2);
        });
      }
    }

    if (!this.isStatic) {
      // MAKE ELEMENTS (NOT LINES) DRAGGABLE
      this.paper.forEach(function(el) {
        // Don't bind move listener on Transitions (connections).
        if(el.shapeType !== undefined && el.shapeType !== 'Transition'){ 
          this.moveElement(el);
        }
        // Bind contextmenu to all elements, to enable options such as removing.
        this.enableContextMenu(el);
      }, this);
    }
  },

  clear: function() {
    this.paper.clear();
    this.connections.length = 0;
  },

  enableContextMenu: function(element) {
    var canvas = "#canvas"
        // These two should be updated every resize. need to fix this!
        var position = $(canvas).position();
        var offset = $(canvas).offset();
        // DEBUG
        $( "#log-form" ).text("positionX:" + position.left + ", Y: " + position.top + ". offsetX:"+ offset.left +", offsetY:" + offset.top);
    $( window ).resize(function() {
        position = $(canvas).position();
        offset = $(canvas).offset();
        // DEBUG
        $( "#log-form" ).text("positionX:" + position.left + ", Y: " + position.top + ". offsetX:"+ offset.left +", offsetY:" + offset.top);
    });
    var contextMenu = $('#editor-contextmenu'),
        me = this;
        $( document ).on( "mousemove", function( event ) {
        	var canvasX = parseInt(event.pageX - offset.left - 1)
        	var canvasY = parseInt(event.pageY - offset.top - 22)
        	if (canvasX < 0 || canvasY < 0) {
        		canvasX = "out of range";
        		canvasY = "out of range";
        	};
          // DEBUG
        	$( "#log" ).text("X: " + event.pageX + ", Y: " + event.pageY + ". Canvas X:"+ canvasX +", canvas Y:" + canvasY);
        });
    $(element[0]).on('contextmenu', function(e) {
      contextMenu.css({
        display: "block",
        left: (event.pageX+position.left-offset.left),
        top: (event.pageY-offset.top+position.top)
      });

      // FIXME why is this called twice per element?
      contextMenu.on('click', 'a#remove-element', function() {
        // Remove transitions.
        element.connections.forEach(function(connection) {
          if (connection.from === element) {
            // Connection is outgoing from me.
            me.removeConnection(connection.to, connection);
          } else {
            // Connnection is incoming to me.
            me.removeConnection(connection.from, connection);
          }
        });
        element.connections.length = 0;
        if (element.pair !== undefined) {
          // Remove element paired to this item (should be text).
          element.pair.remove();
        }
        $(element[0]).remove();
        contextMenu.hide();
      });

      // Listener for adding annotations
      // TODO support editing/deleting annotation
      // FIXME doesn't work for transitions
      //FIXME: Need to fix location for pool & lane annotations
      contextMenu.on('click', 'a#add-annotation', function() {
        var textToAdd = prompt('Annotation:');
        if (textToAdd == null || textToAdd.trim() == '') return;
        if (element.shapeType == 'Text') {
          var temp = element;
          element = element.pair;
          element.pair = temp;
        }
        if (element.pair !== undefined) {
          // Remove element paired to this item (should be text).
          element.pair.remove();
        }
        var xpdl = element.associatedXPDL,
            x = parseInt(xpdl.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.XCoordinate),
            y = parseInt(xpdl.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.YCoordinate),
            height = parseInt(xpdl.NodeGraphicsInfos.NodeGraphicsInfo.Height),
            width = parseInt(xpdl.NodeGraphicsInfos.NodeGraphicsInfo.Width);

        if (element.shapeType == 'Pool' || element.shapeType == 'PoolLane'){
          var offset = 10; 
          //FixMe: Need to check if correct location after the x&y are updated
          var text = me.paper.text(x+offset, y+height/2, textToAdd).attr({transform: "r" + 270});
          text.shapeType = 'RotatedText';
        }
        else {
          var text = me.paper.text(x+width/2, y+height/2, textToAdd);
        }

        text.toFront();
        text.shapeType = 'Text';

        // PAIRING SHAPE AND TEXT
        element.pair = text;
        text.pair = element;
        contextMenu.hide();
      });

      //FIXME: only show for pool elements
      contextMenu.on('click', 'a#add-pool', function() {
        if (element.shapeType != 'Pool'){
          alert('Can only add lanes to pools');
          contextMenu.hide(); 
          return;
        }
        var laneTitle = prompt('Please enter title of lane:');
        //if (textToAdd == null || textToAdd.trim() == '') return;
        var x = 10, y = 10;
        if (totalLanes > 0){
          //get current pool title
          var poolTitle = element.pair[0].textContent;

          //remove old pool & title elements
          element.pair.remove();
          $(element[0]).remove();
        }

        me.initLane(x,y, laneTitle, poolTitle);  
        contextMenu.hide();
      });

      // Hide menu when click elsewhere.
      $('body:not(#editor-contextmenu)').click(function() {
        contextMenu.off('click', 'a#remove-element');
        contextMenu.off('click', 'a#add-annotation');
        contextMenu.off('click', 'a#add-pool');
        contextMenu.hide();
      });
      return false;
    });
  },

  onConnect: function(callback) {
    var me = this,
        firstSelected,
        secondSelected;

    me.paper.forEach(function (el) {
      if (el.hasOwnProperty('associatedXPDL') === false) {
        return; // ignore those without associated XPDLs
      }
      $(el[0]).click(function() {
        if (firstSelected === undefined) {
          firstSelected = el;
        }
        else {  // first has already been selected
          secondSelected = el;
          assert(firstSelected !== undefined && secondSelected !== undefined,
            'Both required elements not selected for a connection.');
          // Both elements now selected; proceed to connect them.
          me.connectElements(firstSelected, secondSelected);
          // Unbind click listener for all elements.
          me.paper.forEach(function (el) {
            $(el[0]).unbind('click');
          });
          callback('success');  // we have finished connecting
        }
      });
    });
  },

  connectElements: function(element1, element2) {
    var connection = this.paper.connection(element1, element2, "#000");
    connection.shapeType = 'Transition';
    this.connections.push(connection);
    element1.connections.push(connection);
    element2.connections.push(connection);

    //If gateway element, ask for condition(s)
    if (element1.shapeType == 'Route'){
      var textToAdd = prompt('Condition:');

      //If null, path is always travelled -> parallel
      if (textToAdd == null || textToAdd.trim() == '') return;
      
      //Need to determine correct x & y 
      var x = 0, y =0;
      var text = this.paper.text(x, y, textToAdd);
      text.shapeType = 'Condition';

      // PAIRING SHAPE AND TEXT
      connection.pair = text;
      text.pair = connection;
    }
  },

  removeConnection: function(element, connectionToRemove) {
    // Remove 'connectionToRemove' from element's connections.
    element.connections.forEach(function(connection, index) {
      if (connection === connectionToRemove) {
        element.connections.splice(index, 1);
        return;
      }
    });
    // Remove from global connections as well.
    var me = this;
    me.connections.forEach(function(connection, index) {
      if (connection === connectionToRemove) {
        me.connections.splice(index, 1);
        return;
      }
    });
    // Remove line connection from canvas.
    connectionToRemove.line.remove();
  },

  moveElement : function(element) {
    var connections = this.connections,
        dragger = function() {
          this.odx = 0;
          this.ody = 0;
          this.animate({"fill-opacity": .2}, 500);
        },
        move = function(dx, dy) {
          //Only allow vertical movement for pools & pool lanes
          if (this.shapeType == 'Pool' || this.shapeType == 'PoolLane'){
            this.translate(0, dy - this.ody);
          }
          else{
            this.translate(dx - this.odx, dy - this.ody);
          }
          
          if (this.pair) {
            //Only allow vertical movement for pools & pool lanes titles
            if (this.pair.shapeType  == 'RotatedText' ){
              this.pair.translate(-(dy - this.ody), 0);
            }
            else{
              this.pair.translate(dx - this.odx, dy - this.ody);  
            }
            this.pair.odx = this.pair.attr("dx");
            this.pair.ody = this.pair.attr("dy");
          }
          for (var i = connections.length; i--;) {
            this.paper.connection(connections[i]);
          }

          this.odx = dx;
          this.ody = dy;
        },
        up = function () {
          this.animate({"fill-opacity": 1}, 500);
        };
    if (element.shapeType != "Condition"){
      element.drag(move, dragger, up);  
    }
  },

  getById : function(id) {
    var element;
    this.paper.forEach(function (el) {
      if (el.hasOwnProperty('associatedXPDL') === true) {
        if (el.associatedXPDL.Id === id) {
          element = el;
          return;
        }
      }
    });
    return element;
  },
  
  paintActivity : function(xpdlActivity, x, y, height, width, borderColor, fillColor, name){
    var shape;

    for(var activityProperty in xpdlActivity)
    {
      
      switch(activityProperty){
        
        case 'Event':
          shape = this.paintEvent(xpdlActivity,x,y,width, height, name, fillColor, borderColor);
          break;

        case 'Implementation':

          if(xpdlActivity.Implementation.hasOwnProperty('Task'))
            shape = this.paintImplementation(xpdlActivity,x,y,width,height, name, fillColor, borderColor);
          
          break;

        case 'Route':
            shape = this.paintRoute(xpdlActivity,x,y,width,height, name, fillColor, borderColor);
          break;
      }
    }

    return shape;
  },

  paintEvent : function(xpdlEvent, x, y, width, height, name, fillColor, borderColor){
    // var shape = this.paper.circle(x+width/2, y+height/2, width/2).attr('cursor', 'move');
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    shape.associatedXPDL = xpdlEvent;
    shape.outgoing = [];
    shape.incoming = [];
    shape.connections = [];

    shape.shapeType = 'Event';
    var cssClass = "";
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);
    
    return shape;
  },

  // Task
  paintImplementation : function(xpdlImplementation, x, y, width, height, name, fillColor, borderColor){
    // paint shape
    // var shape = this.paper.rect(x, y, width, height, 5).attr('cursor', 'move');
    var shape = this.paper.rect(x, y, width, height, 5);
    shape.associatedXPDL = xpdlImplementation;
    shape.shapeType = 'Implementation';
    shape.outgoing = [];
    shape.incoming = [];
    shape.connections = [];

    // add text
    // var text = this.paper.text(x+width/2,y+height/2,name).attr('cursor', 'move');
    var text = this.paper.text(x+width/2,y+height/2,name);
    text.shapeType = 'Text';

    // PAIRING SHAPE AND TEXT
    shape.pair = text;
    text.pair = shape;

    // add interactivity
    //shape.hover(function(){shape.transform('S1.2')},function(){shape.transform('S1')})
    //shape.click(function(){alert(name)});

    // apply cssClass
    var cssClass = "";
    $(shape.node).attr("class",cssClass);
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);

    return shape;
  },

  // Gateway
  paintRoute : function(xpdlRoute, x, y, width, height, name, fillColor, borderColor){
    var strPath = "M" + String(x+width/2) + " " + String(y+height) + ",L" + String(x+width) + " " + String(y+height/2) +",L" + String(x+width/2) + " " + String(y) + ",L" + String(x) + " " + String(y+height/2) + "Z";
    
    var shape = this.paper.path(strPath).attr({fill: fillColor});
    // var shape = this.paper.rect(x, y, width, height);
    shape.outgoing = [];
    shape.incoming = [];
    shape.connections = [];

    // shape.rotate(45, x, y);
    shape.associatedXPDL = xpdlRoute;
    shape.shapeType = 'Route';
    // var text = this.paper.text(x+width/2,y+height/2,name).attr('cursor', 'move');
    var text = this.paper.text(x+width/2,y+height/2,name);
    text.shapeType = 'Text';

    // PAIRING SHAPE AND TEXT
    shape.pair = text;
    text.pair = shape;

    var cssClass = "";
    $(shape.node).attr("class",cssClass);
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);

    return shape;
    
  },

  paintPool: function(xpdlRoute, x, y, poolTitleText, fillColor, borderColor){
    var lanes = totalLanes;
    if (lanes == 0) {lanes = 1;}
    x = 0;
    var offset = 10,
        width = this.paper.canvas.offsetWidth,
        height = 350*lanes,
        y1 = y+offset*4;

    var pool = this.paper.rect(x,y1,width,height).attr({fill: fillColor, border: borderColor});
    pool.associatedXPDL = xpdlRoute;
    pool.shapeType = 'Pool';
    var poolTitle = this.paper.text(x+offset, y1+height/2, poolTitleText).attr({transform: "r" + 270});
    
    //Pair pool title with pool 
    pool.pair = poolTitle;
    poolTitle.pair = pool;
    poolTitle.shapeType = 'RotatedText';

    //Ordering of elements - put pool behind everything
    pool.toBack();
  
    return pool;
  },

  paintLane: function(xpdlRoute, x, y, laneTitleText, poolTitle, fillColor, borderColor){
    //New Lane, increment total number of lanes
    totalLanes += 1;

    var offset = 10,
        x1 = x+offset*2,
        y1 = y+40+((totalLanes-1)*350),
        width = this.paper.canvas.offsetWidth - x1,
        height = 350;

    var poolLane = this.paper.rect(x1,y1,width,height).attr({fill: fillColor, border: borderColor});
    poolLane.associatedXPDL = xpdlRoute;
    poolLane.shapeType = 'PoolLane';
    var laneTitle = this.paper.text(x1+offset, y1+height/2, laneTitleText).attr({transform: "r" + 270});
    
    //Pair lane title with pool lane
    poolLane.pair = laneTitle;
    laneTitle.pair = poolLane;
    laneTitle.shapeType = 'RotatedText';  

    if (totalLanes > 1){
      //Redraw expanded pool if greater than 1 lane
      this.initPool(x,y, poolTitle);
    }
    
      //Ordering of elements - put pool behind everything
      var front = this.paper.set();
      var mid = this.paper.set();
      this.paper.forEach(function(el) {
        if (el.shapeType == 'Pool'){
          //do nothing
        }
        else if (el.shapeType == 'PoolLane'){
          mid.push(el);
        }
        else{
          front.push(el);
        }
      });
      mid.insertBefore(front);
    return poolLane;
  },

  getCss: function(bpmnElement, cssClass){
    for(i in this.highlighted){
      if(this.highlighted[i] == bpmnElement){
        cssClass += "-high";
        break;
      }
    }
    return cssClass;
  },

  //===========================================================================
  //  Driver/helper functions called by toolbox items in workflow editor.
  //===========================================================================

  // Common to all activities: allows drag/move, contextmenu and gives a new ID
  initActivity: function(activity) {
    this.moveElement(activity);
    this.enableContextMenu(activity);
    activity.associatedXPDL.Id = String(this.currentId);
    this.currentId++;
    console.log('id =' + activity.associatedXPDL.Id);
    return activity;
  },

  initStartEvent: function(x, y) {

    // TODO add to this.xpdlJson
    var xpdlJson = XpdlJsonGenerator.getNewStartEventJson(this.currentId, x, y);
    this.currentId++;

    // TODO read height/width/color properties for xpdlJson instead b/c this is error-prone.
    var shape = this.initActivity(this.paintEvent(xpdlJson, x, y, 30, 30, '', 'green', 'black'));

    return shape;
  },

  initIntermediateEvent: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewIntermediateEventJson(this.currentId, x, y);
    this.currentId++;

    return this.initActivity(this.paintEvent(xpdlJson, x, y, 30, 30, '', 'yellow', 'black'));
  },

  initEndEvent: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewEndEventJson(this.currentId, x, y);
    this.currentId++;

    return this.initActivity(this.paintEvent(xpdlJson, x, y, 30, 30, '', 'red', 'black'));
  },

  initGateway: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewGatewayJson(this.currentId, x, y);
    this.currentId++;

    return this.initActivity(this.paintRoute(xpdlJson, x, y, 40, 40, '', 'yellow', 'black'));
  },
  
  initTask: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewTaskJson(this.currentId, x, y);
    this.currentId++;

    return this.initActivity(this.paintImplementation(xpdlJson, x, y, 90, 60, '', 'blue', 'black'));
  },
  
  initPool: function(x,y, poolTitle){
    var xpdlJson = XpdlJsonGenerator.getNewTaskJson(this.currentId, poolTitle, x, y);
    this.currentId++;

    return this.initActivity(this.paintPool(xpdlJson, x, y, poolTitle, 'cornflowerblue', 'black'));
  },

  initLane: function(x,y, laneTitle, poolTitle){
    // TODO
    // FIND OUT THE FORMAT OF THE LANE
    var xpdl = 'xpdlLane';
    return this.initActivity(this.paintLane(xpdl, x, y, laneTitle, poolTitle, 'purple', 'black'));
  },

  // CALLED WHEN THE USER CLICKS THE SAVE BUTTON
  updateXPDL: function(){
    this.paper.forEach(function(shape){

      if(shape.hasOwnProperty('shapeType')){
          switch(shape.shapeType){
          case 'Pool':
          break;
          case 'PoolLane':
          break;
          case 'Transition':
          break;
          case 'Route':
          break;
          case 'Condition':
          break;
          case 'Event':
          break;
          case 'Text':
          break;
          case 'RotatedText':
          break;
        }
      }
      else{
        console.log('This shape (' + shape + 'doesn\'t have a type');
      }
    });
  },
};      
