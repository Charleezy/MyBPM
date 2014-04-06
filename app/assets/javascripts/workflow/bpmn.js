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
function assert(condition, message) {
  if (!condition) {
      throw message || "Assertion failed";
  }
}
        
// Constructor
net.BpmnJS = function(xpdlJson, canvas, isStatic){

  // ALL ID'S GENERATED FROM THE BEGINNING
  this.idList = [];

  // IF THE JSON OBJECT IS NOT CREATED AT THE BEGINNING
  if(xpdlJson === null)
    this.xpdlJson = XpdlJsonGenerator.getNewWorkflowJson(this.generateNewID());
  else
    this.xpdlJson = xpdlJson;

  // USED FOR SIMULATION
  this.isStatic = isStatic;

  this.totalLanes = 0;

  // RAPHAEL CANVAS
  this.paper = Raphael(canvas, canvas.clientWidth, canvas.clientHeight);
  
  this.connections = [];
  this.allConnections = [];
  this.newConnections = [];
  this.oldConnections = [];
  this.removedConnectionsIds = [];

  this.allActivities = [];
  this.newActivities = [];
  this.oldActivities = [];
  this.removedActivitiesIds = [];

  this.pools = [];
  this.allPools = [];
  this.newPools = [];
  this.oldPools = [];
  this.removedPoolsIds = [];

  this.lanes = [];
  this.allLanes = [];
  this.newLanes = [];
  this.oldLanes = [];
  this.removedLanesIds = [];
};

// Shared functions
net.BpmnJS.prototype = {

  // REPLACES A PROPERTY ON A TREE OF JAVASCRIPT OBJECTS
  replaceProperty: function(object, property, oldValue, newValue){

    // IF WE FOUND IT, JUST REPLACE
    if(object.hasOwnProperty(property) && object[property] === oldValue){
      object[property] = newValue;
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
    // Assume we are only handling a single workflow process (there's only one WorkflowProcess inside WorkflowProcesses)

    console.log("Root:");
    console.log(this.xpdlJson);
    $('#asdf').val(JSON.stringify(this.xpdlJson));
    
    // Last process
    this.process = this.xpdlJson["WorkflowProcesses"][0]["WorkflowProcess"][0],
        me = this;
    
    // TODO
    // FINISH IMPORT FOR POOLS
    // WE HAVE A PROBLEM: POOLS MAY NOT HAVE COORDINATES (ACCORDING TO ZARTAB'S EXAMPLE AND XPDL SCHEMA)
    // Parse through processes' pools
    if (this.xpdlJson.hasOwnProperty('Pools')) {
      this.pools = this.xpdlJson["Pools"][0]["Pool"];

        // PAINTING EACH POOL
        this.pools.forEach(function(pool){
          console.log('Pool:');
          console.log(pool);
          var temporaryId = pool.Id;
          // console.log('newId: ' + pool.Id);
          // The coordinates of the pools
          
          // FIXIT
          // borderColor and fillColor shouldn't be hardcoded here
          var borderColor = pool["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].BorderColor;
          var fillColor = pool["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].FillColor;
          var name = pool.Name;
          var poolShape = me.paintPool(pool, 10, 10, null,name, 'lightblue', 'black');

          // TODO
          // FINISH IMPORT FOR LANES
          // WE HAVE THE SAME PROBLEM WITH THE LANES (NO COORDINATES)
          var lanes = pool['Lanes'][0]['Lane'];
          console.log(lanes);

          // PAINTING EACH LANE
          lanes.forEach(function(lane){
            var name = lane.Name;
            // FIXIT
            // I HARDCODED THE COORDINATES OF THE LANE TO x=10 y=10 BUT WE SHOULD FIX IT
            me.paintLane(lane, 10, 10, name, poolShape, 'white', 'black');
          });

        });
    }

    // Parse through processes' activities
    if (this.process.hasOwnProperty('Activities')) {
      var activities = this.process["Activities"][0]["Activity"];
      activities.forEach(function(activity) {
        var temporaryId = activity.Id;
        // console.log('newId: ' + activity.Id);
        var xCoordinate = parseInt(activity["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0]["Coordinates"][0].XCoordinate);
        var yCoordinate = parseInt(activity["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0]["Coordinates"][0].YCoordinate);
        var height = parseInt(activity["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Height);
        var width = parseInt(activity["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Width);
        var borderColor = activity["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].BorderColor;
        var fillColor = activity["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].FillColor;
        var name = activity.Name;
        var activityShape = me.paintActivity(activity, xCoordinate, yCoordinate, height, width, borderColor, fillColor, name);
        me.allActivities.push(activityShape);
        me.oldActivities.push(activityShape);
      });
    }

    // Parse through processes' transitions
    if (this.process.hasOwnProperty('Transitions')) {
      this.transitions = this.process["Transitions"][0]["Transition"];
      this.transitions.forEach(function(transition) {
        // Reference the activities we're transitioning to/from.
        var element1 = me.getById(transition.From);
        var element2 = me.getById(transition.To);
        if (transition.hasOwnProperty('Condition')){
          var condition = transition["Condition"][0];
        }
        else {
          var condition = "";
        }

        // Create link association between the two activities.
        var connection = me.connectElements(element1, element2, condition, 'imported');
        connection.associatedXPDL = transition;
      });
    }

    if (!this.isStatic) {
      // MAKE ELEMENTS (NOT LINES) DRAGGABLE
      this.paper.forEach(function(el) {
        // Don't bind move listener on Transitions (connections).
        if(el.shapeType !== undefined && el.shapeType !== 'Transition'){ 
          this.moveElement(this, el);
        }
        // Bind contextmenu to all elements, to enable options such as removing.
        this.enableContextMenu(el, this);
      }, this);
    }
  },
  
  funSaveAsImage: function() {
    var svg = this.paper.toSVG();
    canvg(document.getElementById('myCanvas'), svg);
    $("#myCanvas").hide();
    var varMyCanvas = document.getElementById("myCanvas");
    var img = new Image();
    img    = varMyCanvas.toDataURL("image/png");
    var choice = confirm("are you sure you want to download?");
    if (choice == true)
      {
        var fileName = prompt("Please enter the name of the file","workflow.png");
        var a = $("<a>").attr("href", img).attr("download", fileName).appendTo("body");
        a[0].click();
        a.remove();
      }
  },

  clear: function() {
    this.paper.clear();
    this.allConnections.length = 0;
    this.totalLanes = 0;
  },

  enableContextMenu: function(element, workflow) {
    var canvas = "#canvas"
        // These two should be updated every resize. need to fix this!
        var position = $(canvas).position();
        var offset = $(canvas).offset();
        // DEBUG
        $( "#log-form" ).text("positionX:" + position.left + ", Y: " + position.top + ". offsetX:"+ offset.left +", offsetY:" + offset.top);
    $( window ).resize(function() {
        position = $(canvas).position();
        offset = $(canvas).offset();
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
        if(element.hasOwnProperty('shapeType')){
          console.log('removing ' + element.shapeType);
          switch(element.shapeType){
            case 'StartEvent':
            case 'IntermediateEvent':
            case 'EndEvent':
            case 'Gateway':
            case 'Task':
              me.removedActivitiesIds.push(element.associatedXPDL.Id);
              console.log('me.removedActivitiesIds:');
              console.log(me.removedActivitiesIds);
              break;
          }
        }
        // If the element has connections, remove them.
        if(element.hasOwnProperty('connections')){
          element.connections.forEach(function(connection) {
            if (connection.from === element) {
              // Connection is outgoing from me.
              me.removeConnection(connection.to, connection);
            } else {
              // Connnection is incoming to me.
              me.removeConnection(connection.from, connection);
            }
            
            // REMOVE FROM GLOBAL CONNECTION ARRAY
            var connectionToRemove = connection;
            workflow.removedConnectionsIds.push(connection.associatedXPDL.Id);

            workflow.allConnections.forEach(function(connection, index) {
              if (connection === connectionToRemove) {
                workflow.allConnections.splice(index, 1);
                return;
              }
            });
            workflow.oldConnections.forEach(function(connection, index) {
              if (connection === connectionToRemove) {
                workflow.oldConnections.splice(index, 1);
                return;
              }
            });
            workflow.newConnections.forEach(function(connection, index) {
              if (connection === connectionToRemove) {
                workflow.newConnections.splice(index, 1);
                return;
              }
            });
          });
          element.connections = [];
          element.connections.length = 0;
        }
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
        if (textToAdd === null) return;
        if (element.shapeType === 'Text') {
          var temp = element;
          element = element.pair;
          element.pair = temp;
        }
        if (element.pair !== undefined) {
          // Remove element paired to this item (should be text).
          element.pair.remove();
        }

        element.associatedXPDL.Name = textToAdd;
        var x = element.getBBox().x,
            y = element.getBBox().y,
            height = element.getBBox().height,
            width = element.getBBox().width;

        if (element.shapeType === 'Pool' || element.shapeType === 'Lane'){
          var offset = 10; 
          //FixMe: Need to check if correct location after the x&y are updated
          var text = me.paper.text(x+offset, y+height/2, textToAdd).attr({transform: "r" + 270});
          text.shapeType = 'RotatedText';
        }
        else {
          var text = me.paper.text(x+width/2, y+height/2, textToAdd);
          text.shapeType = 'Text';
        }

        text.toFront();

        // PAIRING SHAPE AND TEXT
        element.pair = text;
        text.pair = element;
        contextMenu.hide();
      });

      //FIXME: only show for pool elements
      contextMenu.on('click', 'a#add-pool-lane', function() {
        if (element.shapeType != 'Pool'){
          alert('Can only add lanes to pools');
          contextMenu.hide(); 
          return;
        }
        var laneTitle = prompt('Please enter title of lane:');
        if (laneTitle === null) return;
        var x = 10, y = 10;

        me.initLane(x,y, laneTitle, element);  
        contextMenu.hide();
      });

      // Hide menu when click elsewhere.
      $('body:not(#editor-contextmenu)').click(function() {
        contextMenu.off('click', 'a#remove-element');
        contextMenu.off('click', 'a#add-annotation');
        contextMenu.off('click', 'a#add-pool-lane');
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
          var connection = me.connectElements(firstSelected, secondSelected, null);
          connection.associatedXPDL = XpdlJsonGenerator.getNewTransitionJson(me.generateNewID(), 'Transition', firstSelected.associatedXPDL.Id, secondSelected.associatedXPDL.Id);
          console.log(connection.line.associatedXPDL.ConnectorGraphicsInfos);
          // Unbind click listener for all elements.
          me.paper.forEach(function (el) {
            $(el[0]).unbind('click');
          });
          callback('success');  // we have finished connecting
        }
      });
    });
  },

  findMidpoint: function(element1, element2, coordinate){
    console.log(eval("element1.getBBox()."+coordinate));
    var el1 = eval("element1.getBBox()."+coordinate),
        el2 = eval("element2.getBBox()."+coordinate);

     pt = Math.abs((el1-el2)/2);
     if (el1 > el2){
        pt= pt+ el2;
      }
      else {pt= pt+ el1}
      return pt;
  },

  connectElements: function(element1, element2, condition, newOrImported) {
    var connection = this.paper.connection(element1, element2, "#000");
    connection.line.shapeType = 'Transition';
    connection.line.associatedXPDL = XpdlJsonGenerator.getNewTransitionJson(this.generateNewID(), element1.associatedXPDL.Id, element2.associatedXPDL.Id);
    this.allConnections.push(connection);
    element1.connections.push(connection);
    element2.connections.push(connection);

    if(typeof newOrImported === 'undefined' || newOrImported === 'new'){
      this.newConnections.push(connection);
    }
    else{
      this.oldConnections.push(connection);
    }

    //If gateway element, ask for condition(s)
    if (element1.shapeType === 'Gateway'){
      //If new element, ask for condition
      if (condition === null){
        condition = prompt('Condition:');
        //If null, path is always travelled -> parallel
        if (condition === null || condition.trim() === '') return;
      }
      
      //Finds midpoint between the two elements
      var x = this.findMidpoint(element1, element2, "x"),
      y = this.findMidpoint(element1, element2, "y");
      x = -1000, y = -1000;
     
      var text = this.paper.text(x, y, condition);
      text.shapeType = 'Condition';

      // PAIRING SHAPE AND TEXT
      connection.pair = text;
      text.pair = connection;
    }

    return connection;
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
    me.allConnections.forEach(function(connection, index) {
      if (connection === connectionToRemove) {
        me.allConnections.splice(index, 1);
        return;
      }
    });
    me.oldConnections.forEach(function(connection, index) {
      if (connection === connectionToRemove) {
        me.oldConnections.splice(index, 1);
        return;
      }
    });
    me.newConnections.forEach(function(connection, index) {
      if (connection === connectionToRemove) {
        me.newConnections.splice(index, 1);
        return;
      }
    });
    // Remove line connection from canvas.
    connectionToRemove.line.remove();
  },

  moveElement : function(me, element) {
    var connections = this.allConnections,
        dragger = function() {
          this.odx = 0;
          this.ody = 0;
          this.animate({"fill-opacity": .2}, 500);
        },
        move = function(dx, dy) {
          //Don't allow movement for pools & pool lanes
          if (this.shapeType === 'Pool' || this.shapeType === 'Lane'){
            return;
          }
          
          this.translate(dx - this.odx, dy - this.ody);
          
          //Don't allow movement for pools & pool lanes titles
          if (this.pair && this.pair.shapeType  != 'RotatedText' ) {
            this.pair.translate(dx - this.odx, dy - this.ody);  
            this.pair.odx = this.pair.attr("dx");
            this.pair.ody = this.pair.attr("dy");
          }

          //Move connections as well
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
          if(xpdlActivity['Event'][0].hasOwnProperty('StartEvent')){
            shape = this.paintStartEvent(xpdlActivity,x,y,width, height, name, fillColor, borderColor);
          }
          else if(xpdlActivity['Event'][0].hasOwnProperty('IntermediateEvent')){
            shape = this.paintIntermediateEvent(xpdlActivity,x,y,width, height, name, fillColor, borderColor);
          }
          else{
            shape = this.paintEndEvent(xpdlActivity,x,y,width, height, name, fillColor, borderColor);
          }
          break;

        case 'Implementation':

          // if(xpdlActivity["Implementation"][0].hasOwnProperty('Task'))
            shape = this.paintImplementation(xpdlActivity,x,y,width,height, name, fillColor, borderColor);
          
          break;

        case 'Route':
            shape = this.paintRoute(xpdlActivity,x,y,width,height, name, fillColor, borderColor);
          break;
      }
    }

    return shape;
  },

  paintStartEvent : function(xpdlEvent, x, y, width, height, name, fillColor, borderColor){
    // var shape = this.paper.circle(x+width/2, y+height/2, width/2).attr('cursor', 'move');
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    shape.associatedXPDL = xpdlEvent;
    shape.outgoing = [];
    shape.incoming = [];
    shape.connections = [];

    shape.shapeType = 'StartEvent';
    var cssClass = "";
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);
    $(shape.node).attr("class",'startEvent');
    $(shape.node).attr("id",xpdlEvent.Id);
    $(shape.node).attr("data-type","StartEvent");
    
    return shape;
  },

  paintIntermediateEvent : function(xpdlEvent, x, y, width, height, name, fillColor, borderColor){
    // var shape = this.paper.circle(x+width/2, y+height/2, width/2).attr('cursor', 'move');
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    shape.associatedXPDL = xpdlEvent;
    shape.outgoing = [];
    shape.incoming = [];
    shape.connections = [];

    shape.shapeType = 'IntermediateEvent';
    var cssClass = "";
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);
    $(shape.node).attr("class",'intermediateEvent');
    $(shape.node).attr("id",xpdlEvent.Id);
    $(shape.node).attr("data-type","IntermediateEvent");
    
    return shape;
  },

  paintEndEvent : function(xpdlEvent, x, y, width, height, name, fillColor, borderColor){
    // var shape = this.paper.circle(x+width/2, y+height/2, width/2).attr('cursor', 'move');
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    shape.associatedXPDL = xpdlEvent;
    shape.outgoing = [];
    shape.incoming = [];
    shape.connections = [];

    shape.shapeType = 'EndEvent';
    var cssClass = "";
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);
    $(shape.node).attr("class",'endEvent');
    $(shape.node).attr("id",xpdlEvent.Id);
    $(shape.node).attr("data-type","EndEvent");
    
    return shape;
  },

  // Task
  paintImplementation : function(xpdlImplementation, x, y, width, height, name, fillColor, borderColor){
    // paint shape
    // var shape = this.paper.rect(x, y, width, height, 5).attr('cursor', 'move');
    var shape = this.paper.rect(x, y, width, height, 5);
    shape.associatedXPDL = xpdlImplementation;
    shape.shapeType = 'Task';
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
    var cssClass = "implementation";
    $(shape.node).attr("class",cssClass);
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);
    $(shape.node).attr("id",xpdlImplementation.Id);
    $(shape.node).attr("data-type","Task");

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
    shape.shapeType = 'Gateway';
    // var text = this.paper.text(x+width/2,y+height/2,name).attr('cursor', 'move');
    var text = this.paper.text(x+width/2,y+height/2,name);
    text.shapeType = 'Text';

    // PAIRING SHAPE AND TEXT
    shape.pair = text;
    text.pair = shape;

    var cssClass = "route";
    $(shape.node).attr("class",cssClass);
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);
    $(shape.node).attr("id",xpdlRoute.Id);
    $(shape.node).attr("data-type","Gateway");

    return shape;
    
  },

  paintPool: function(xpdlRoute, x, y, pool, poolTitleText, fillColor, borderColor){
    var lanes = this.totalLanes;
    if (lanes === 0) {lanes = 1;}
    x = 0;
    var offset = 10,
        width = this.paper.canvas.offsetWidth,
        height = 350*lanes,
        y1 = y+offset*4;

    if (pool != null){
      //pool exists, resize
      pool.attr({height: height});
    }
    else {
      pool = this.paper.rect(x,y1,width,height).attr({fill: fillColor, border: borderColor});
      pool.associatedXPDL = xpdlRoute;
      pool.shapeType = 'Pool';
      $(pool.node).attr("id",xpdlRoute.Id);
      $(pool.node).attr("data-type","Pool");
    }
    var poolTitle = this.paper.text(x+offset, y1+height/2, poolTitleText).attr({transform: "r" + 270});
    
    //Pair pool title with pool 
    pool.pair = poolTitle;
    poolTitle.pair = pool;
    poolTitle.shapeType = 'RotatedText';

    //Ordering of elements - put pool behind everything
    pool.toBack();

    $(pool.node).attr("class", 'pool');
    return pool;
  },

  // FIXIT
  // WE SHOULD CHANGE THE WAY WE PAINT LANES
  paintLane: function(xpdlRoute, x, y, laneTitleText, pool, fillColor, borderColor){
    //New Lane, increment total number of lanes
    this.totalLanes += 1;

    var offset = 10,
        x1 = x+offset*2,
        // FIXIT
        // Y OFFSET OF THE LANE IS HARDCODED HERE AS 50
        y1 = y+40+((this.totalLanes-1)*350),
        width = this.paper.canvas.offsetWidth - x1,
        height = 350;

    var poolLane = this.paper.rect(x1,y1,width,height).attr({fill: fillColor, border: borderColor});
    poolLane.associatedXPDL = xpdlRoute;
    poolLane.shapeType = 'Lane';
    $(poolLane.node).attr("id",xpdlRoute.Id);
    $(poolLane.node).attr("data-type","Lane");
    var laneTitle = this.paper.text(x1+offset, y1+height/2, laneTitleText).attr({transform: "r" + 270});

    //Pair lane title with pool lane
    poolLane.pair = laneTitle;
    laneTitle.pair = poolLane;
    laneTitle.shapeType = 'RotatedText';

    if (this.totalLanes > 1){
      //Redraw expanded pool if greater than 1 lane
      //Get current pool title
      var poolTitle = pool.associatedXPDL.Name;

      //Remove old pool & title elements
      pool.pair.remove();
      //$(pool[0]).remove();
      //pool.remove();

      this.initPool(x,y, pool, poolTitle);
    }

      //Ordering of elements - put pool behind everything
      var front = this.paper.set();
      var mid = this.paper.set();
      this.paper.forEach(function(el) {
        if (el.shapeType === 'Pool'){
          //do nothing
        }
        else if (el.shapeType === 'Lane'){
          mid.push(el);
        }
        else{
          front.push(el);
        }
      });
      mid.insertBefore(front);

      $(poolLane.node).attr("class", 'lane');

    return poolLane;
  },


  getCss: function(bpmnElement, cssClass){
    for(i in this.highlighted){
      if(this.highlighted[i] === bpmnElement){
        cssClass += "-high";
        break;
      }
    }
    return cssClass;
  },

  //===========================================================================
  //  Driver/helper functions called by toolbox items in workflow editor.
  //===========================================================================

  // Common to all elements: allows drag/move, contextmenu and gives a new ID
  initElement: function(element) {
    this.moveElement(this, element);
    this.enableContextMenu(element, this);
    element.associatedXPDL.Id = this.generateNewID();
    switch(element.shapeType){
      case 'StartEvent':
      case 'IntermediateEvent':
      case 'EndEvent':
      case 'Gateway':
      case 'Task':
        this.newActivities.push(element);
        break;
      case 'Pool':
        this.newPools.push(element);
        break;
      case 'Lane':
        this.newLanes.push(element);
        break;
    }
    return element;
  },

  initStartEvent: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewStartEventJson(this.generateNewID(), x, y),
        name = xpdlJson.Name,
        width = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Width),
        height = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Height),
        //fillColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].FillColor,
        borderColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].BorderColor;

    var shape = this.paintStartEvent(xpdlJson, x, y, width, height, name, 'white', borderColor);
    shape.shapeType = 'StartEvent';
    this.initElement(shape);

    return shape;
  },

  initIntermediateEvent: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewIntermediateEventJson(this.generateNewID(), x, y),
        name = xpdlJson.Name,
        width = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Width),
        height = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Height),
        //fillColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].FillColor,
        borderColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].BorderColor;

    var shape = this.paintIntermediateEvent(xpdlJson, x, y, width, height, name, 'lightyellow', borderColor);
    shape.shapeType = 'IntermediateEvent';
    this.initElement(shape);


    return shape;
  },

  initEndEvent: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewEndEventJson(this.generateNewID(), x, y),
        name = xpdlJson.Name,
        width = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Width),
        height = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Height),
        //fillColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].FillColor,
        borderColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].BorderColor;

    var shape = this.paintEndEvent(xpdlJson, x, y, width, height, name, 'lightblue', borderColor);
    shape.shapeType = 'EndEvent';
    this.initElement(shape);


    return shape;
  },

  initGateway: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewGatewayJson(this.generateNewID(), x, y),
        name = xpdlJson.Name,
        width = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Width),
        height = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Height),
        //fillColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].FillColor,
        borderColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].BorderColor;


    var shape = this.paintRoute(xpdlJson, x, y, width, height, name, 'white', borderColor);
    shape.shapeType = 'Gateway';
    this.initElement(shape);


    return shape;
  },
  
  initTask: function(x, y) {
    var xpdlJson = XpdlJsonGenerator.getNewTaskJson(this.generateNewID(), x, y),
        name = xpdlJson.Name,
        width = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Width),
        height = parseInt(xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].Height),
        //fillColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].FillColor,
        borderColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].BorderColor;

    var shape = this.paintImplementation(xpdlJson, x, y, width, height, name, 'lightyellow', borderColor);
    shape.shapeType = 'Task';
    this.initElement(shape);


    return shape;
  },
  
  initPool: function(x,y, pool, poolTitle){
    var xpdlJson = XpdlJsonGenerator.getNewPoolJson(this.generateNewID(), poolTitle, x, y),
        name = xpdlJson["Name"],
        //fillColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].FillColor,
        borderColor = xpdlJson["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0].BorderColor;

    var shape = this.paintPool(xpdlJson, x, y, pool, name, 'lightblue', borderColor);

    shape.shapeType = 'Pool';
    this.initElement(shape);


    return shape;
  },

  initLane: function(x,y, laneTitle, pool){
    var xpdlJson = XpdlJsonGenerator.getNewLaneJson(this.generateNewID(), laneTitle, x, y);
    var shape = this.paintLane(xpdlJson, x, y, laneTitle, pool, 'whitesmoke', 'black');
    shape.shapeType = 'Lane';
    this.initElement(shape);
    return shape;
  },

  updateArray: function(array, newElementsArray, oldElementsArray, removedIdsArray){
    // UPDATE THE ACTIVITIES
    newElementsArray.forEach(function(element){
      array.push(element.associatedXPDL);
    });
    oldElementsArray.concat(newElementsArray);
    newElementsArray.length = 0;

    array.forEach(function(element, index){
      removedIdsArray.forEach(function(id){
        if(id === element.Id){
          array.splice(index, 1);
        }

      });
    });
    removedIdsArray.length = 0;
  },

  // CALLED WHEN THE USER CLICKS THE SAVE BUTTON
  updateXPDL: function(){

    // UPDATES ASSOCIATED XPDL OF THE SHAPES
    this.paper.forEach(function(shape){

      if(shape.hasOwnProperty('shapeType')){

          // UPDATE COORDINATES
          if (shape.shapeType != 'Text' && shape.shapeType != 'Transition' && shape.shapeType != 'Pool' && shape.shapeType != 'Lane' && shape.shapeType != 'RotatedText' && shape.shapeType != 'Condition') {
            console.log(shape);
            shape.associatedXPDL["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0]["Coordinates"][0].XCoordinate = shape.getBBox().x;
            shape.associatedXPDL["NodeGraphicsInfos"][0]["NodeGraphicsInfo"][0]["Coordinates"][0].YCoordinate= shape.getBBox().y;
          }

          // UPDATE SPECIFIC PROPERTIES
          switch(shape.shapeType){
          case 'Pool':
          break;
          case 'Lane':
          break;
          case 'Transition':
          break;
          case 'Gateway':
          break;
          case 'Condition':
          break;
          case 'StartEvent':
          break;
          case 'IntermediateEvent':
          break;
          case 'EndEvent':
          break;
          case 'Text':
          break;
          case 'RotatedText':
          break;
        }
      }
      else{
        console.log('This shape doesn\'t have a type:');
        console.log(shape);
      }
    });

    // UPDATES THE XPDL TREE WITH THE NEW ELEMENTS CREATED

    // UPDATE THE TRANSITIONS
    this.updateArray(me.xpdlJson['WorkflowProcesses'][0]['WorkflowProcess'][0]['Transitions'][0]['Transition'], this.newConnections, this.oldConnections, this.removedConnectionsIds);

    // UPDATE THE ACTIVITIES
    this.updateArray(me.xpdlJson['WorkflowProcesses'][0]['WorkflowProcess'][0]['Activities'][0]['Activity'], this.newActivities, this.oldActivities, this.removedActivitiesIds);

    // UPDATE THE POOLS
    this.updateArray(me.xpdlJson['Pools'][0]['Pool'], this.newPools, this.oldPools, this.removedPoolsIds);

    // UPDATE THE LANES
    return this.xpdlJson;
  },

  generateNewID: function(){

    // GUARANTEES THAT THE ID IS UNIQUE
    do{
      var newId = UUID.generate();
      var alreadyTaken = false;
      for(var i = 0; i<this.idList.length && !alreadyTaken; i++){
        if(this.idList[i] === newId)
          alreadyTaken = true;
      }
    } while(alreadyTaken);

    this.idList.push(newId);
    // DEBUG    
    // console.log('ID: ' + newId);
    return newId;
  },
};      