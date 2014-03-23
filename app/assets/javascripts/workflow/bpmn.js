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


// I modified some of this to make it work better, feel free to keep doing the same.


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

  // Paint canvas
  this.paper = Raphael(canvas, canvas.clientWidth, canvas.clientHeight);
  this.connections = [];
};

// Shared functions
net.BpmnJS.prototype = {

  plot: function(){

    console.log(this.xpdlJson);
    
    // PAINT
    for(var i=0; i<this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess.length; i++){

      // ACTIVITIES
      if(this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Activities')){
        var activities = this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].Activities.Activity;
        for(var j=0; j<activities.length; j++){
          var activity = activities[j];
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

      // TRANSITIONS
      if(this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Transitions')){
        var transitions = this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].Transitions.Transition,
            me = this;
        transitions.forEach(function(transition) {
          // Reference the activities we're transitioning to/from.
          var element1 = me.getById(transition.From);
          var element2 = me.getById(transition.To);

          // Create link association between the two activities.
          // TODO changes to associatedXPDL required?

          // element1.outgoing.push(element2);
          // element2.incoming.push(element1);

          me.connectElements(element1, element2);
        });
      }
    }

    // DEPRECATED. Associate on activities, not connections/transitions.
    // Instead, for every activity, we maintain a list of "outgoing" paths and "incoming" paths.

    // LINK THE ACTIVITIES TO THE TRANSITIONS
    // this.paper.forEach(function(el) {
    //   if(el.shapeType !== undefined && el.shapeType !== 'Transition'){

    //     // LOOK FOR THE ID OF ELEMENTS LINKED TO THAT TRANSITION
    //     // for(var i in transition.linkedElements){

    //     //   // FIND ELEMENT LINKED FROM AND LINK
    //     //   globalPaper.forEach(function (el){

    //     //     if(el.hasOwnProperty('associatedXPDL') && transition.associatedXPDL.From === el.associatedXPDL.Id){
    //     //       transition.linkedFromElement = el;
    //     //       // LINK THE OTHER WAY AROUND (ELEMENT -> TRANSITIONS)
    //     //       el.transitionLinkedFrom = transition;
    //     //       return false;

    //     //     }

    //     //   });

    //     //   // FIND ELEMENT LINKED TO AND LINK
    //     //   globalPaper.forEach(function (el){

    //     //     if(el.hasOwnProperty('associatedXPDL') && transition.associatedXPDL.To === el.associatedXPDL.Id){
    //     //       transition.linkedToElement = el;
    //     //       // LINK THE OTHER WAY AROUND (ELEMENT -> TRANSITIONS)
    //     //       el.transitionLinkedTo = transition;
    //     //       return false;

    //     //     }

    //     //   });

    //     // }

    //   }
    // });

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
        $( "#log-form" ).text("positionX:" + position.left + ", Y: " + position.top + ". offsetX:"+ offset.left +", offsetY:" + offset.top);
    $( window ).resize(function() {
        position = $(canvas).position();
        offset = $(canvas).offset();
        $( "#log-form" ).text("positionX:" + position.left + ", Y: " + position.top + ". offsetX:"+ offset.left +", offsetY:" + offset.top);
    });
    var contextMenu = $('#editor-contextmenu'),
        me = this;
        $( document ).on( "mousemove", function( event ) {
        	var canvasX = parseInt(event.pageX - offset.left - 1)
        	var canvasY = parseInt(event.pageY - offset.top - 22)
        	if (canvasX < 0 || canvasY < 0) {
        		canvasX = NaN;
        		canvasY = NaN;
        	};
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
        console.log('remove');
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
        console.log('add annotation');
        var textToAdd = prompt('Annotation:');
        if (textToAdd == null || textToAdd.trim() == '') return;
        if (element.pair !== undefined) {
          // Remove element paired to this item (should be text).
          element.pair.remove();
        }
        var activity = element.associatedXPDL,
            x = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.XCoordinate),
            y = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.YCoordinate),
            height = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Height),
            width = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Width);

        var text = me.paper.text(x+width/2, y+height/2, textToAdd);
        text.shapeType = 'Text';

        // PAIRING SHAPE AND TEXT
        element.pair = text;
        text.pair = element;
        contextMenu.hide();
      });

      //FIXME: only show for pool elements
      contextMenu.on('click', 'a#add-pool', function() {
        console.log('add pool');
        var laneTitle = prompt('Please enter title of lane:');
        //if (textToAdd == null || textToAdd.trim() == '') return;
        var x = 10, y = 10;
        if (totalLanes > 0){
          //FIXME: get pool title
          var poolTitle = element.pair.text;

          //remove old pool & title elements
          element.pair.remove();
          $(element[0]).remove();
        }

        me.initLane(x,y+10, laneTitle, poolTitle);  
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
          this.translate(dx - this.odx, dy - this.ody);
          
          if (this.pair) {
            if (this.pair.shapeType  == 'RotatedText' ){
              this.pair.translate(-(dy - this.ody), dx - this.odx);
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

  // DEPRECATED... use connectElements() instead.
  // paintTransition : function(transition, xOrigin, yOrigin, xCoordinates, yCoordinates, borderColor, linkedElements){
  //   var stringPath = "M"+xOrigin+","+yOrigin;

  //   for(var i in xCoordinates){
  //     stringPath += "L"+xCoordinates[i]+","+yCoordinates[i];
  //   }
  //   var shape = this.paper.path(stringPath);
  //   // var shape = this.paper.path(stringPath).attr('cursor', 'move');

  //   shape.linkedElements = linkedElements;

  //   shape.associatedXPDL = transition;

  //   shape.shapeType = 'Transition';

  //   $(shape.node).attr('border', borderColor);
    

  //   return shape;
  // },
  
  paintActivity : function(xpdlActivity, x, y, height, width, borderColor, fillColor, name){
    var shape;

    for(var activityProperty in xpdlActivity)
    {
      console.log(activityProperty);
      
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
    var offset = 10,
        width = this.paper.canvas.offsetWidth-2*offset,
        height = (y+350+ offset)*lanes;
        x1 = x+2*offset;

    var pool = this.paper.path("M "+x+" "+y+" L"+ width +"  "+y+" L"+ width +"  "+height+" L"+ x +"  "+height+"Z").attr({fill: fillColor, border: borderColor});
    pool.associatedXPDL = xpdlRoute;
    pool.shapeType = 'Pool';
    var poolTitle = this.paper.text(x+offset, y+height/2, poolTitleText).attr({transform: "r" + 270});
    
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
        height = (y+350)*totalLanes,
        x1 = x+3*offset,
        y1 = ((totalLanes-1)*height/totalLanes)+3*offset,
        width1 = this.paper.canvas.offsetWidth - x1 - 3*offset,
        height1 = (height-2*offset)/totalLanes - offset;

    var poolLane = this.paper.rect(x1,y1,width1,height1).attr({fill: fillColor, border: borderColor});
    poolLane.associatedXPDL = xpdlRoute;
    poolLane.shapeType = 'PoolLane';
    var laneTitle = this.paper.text(x1+offset, y1+height1/2, laneTitleText).attr({transform: "r" + 270});
    
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

  // Common to all activities: allow drag/move and contextmenu
  initActivity: function(activity) {
    this.moveElement(activity);
    this.enableContextMenu(activity);
  },

  initStartEvent: function(x, y) {
    this.initActivity(this.paintEvent('startevent', x, y, 30, 30, '', 'green', 'black'));
  },

  initIntermediateEvent: function(x, y) {
    this.initActivity(this.paintEvent('intermediateevent', x, y, 30, 30, '', 'gray', 'black'));
  },

  initEndEvent: function(x, y) {
    this.initActivity(this.paintEvent('endevent', x, y, 30, 30, '', 'red', 'black'));
  },

  initGateway: function(x, y) {
    this.initActivity(this.paintRoute('gateway', x, y, 40, 40, '', 'yellow', 'black'));
  },
  
  initTask: function(x, y) {
    this.initActivity(this.paintImplementation('task', x, y, 90, 60, '', 'blue', 'black'));
  },
  
  initPool: function(x,y, poolTitle){
    this.initActivity(this.paintPool('pool', x, y, poolTitle, 'cornflowerblue', 'black'));
  },

  initLane: function(x,y, laneTitle, poolTitle){
    console.log('poolTitle = '+poolTitle);
    //dummy value, until fixed 
    poolTitle = 'poolTitle';
    this.initActivity(this.paintLane('lane', x, y, laneTitle, poolTitle, 'purple', 'black'));
  }
};      
