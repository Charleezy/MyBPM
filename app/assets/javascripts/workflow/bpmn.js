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
        
// Constructor
net.BpmnJS = function(xpdlJson, canvas){

  this.connecting = false;

  this.xpdlJson = xpdlJson;

  // Paint canvas
  this.paper = Raphael(canvas, canvas.clientWidth, canvas.clientHeight);
};

// Shared functions
net.BpmnJS.prototype = {

  plot: function(){
    
    // PAINT
    for(var i=0; i<this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess.length; i++){
      
      // TRANSITIONS
      if(this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Transitions')){
        var transitions = this.xpdlJson.Package.WorkflowProcesses.WorkflowProcess[i].Transitions.Transition;
        for(var j=0; j<transitions.length; j++){
          
          var transition = transitions[j];
          var coordinatesArray = transition.ConnectorGraphicsInfos.ConnectorGraphicsInfo.Coordinates;
          var xOrigin = parseInt(coordinatesArray[0].XCoordinate);
          var yOrigin = parseInt(coordinatesArray[0].YCoordinate);
          
          var xCoordinates = [];
          var yCoordinates = [];
          for(var k=1; k<coordinatesArray.length; k++){
            xCoordinates[k] = parseInt(coordinatesArray[k].XCoordinate);
            yCoordinates[k] = parseInt(coordinatesArray[k].YCoordinate);
          }
          
          var borderColor = transition.ConnectorGraphicsInfos.ConnectorGraphicsInfo.BorderColor;
          var linkedElements = Array();
          linkedElements.push(String(transition.From));
          linkedElements.push(String(transition.To));
          this.paintTransition(transition, xOrigin, yOrigin, xCoordinates, yCoordinates, borderColor, linkedElements);
        }
      }

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
    }

    var globalPaper = this.paper;

    var test = this;

    globalPaper.forEach(function (el){
      el.click(function(){
        console.log(test.connecting);
        if(test.connecting){
          if(test.firstSelected === false){
            alert('first');
            test.firstSelected = el;
          }
          else{
            alert('second');
            test.firstSelected = false;
            console.log(test.firstSelected.associatedXPDL);
            var x1 = parseInt(test.firstSelected.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.xCoordinate) + test.firstSelected.dx
              , y1 = parseInt(test.firstSelected.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.yCoordinate) + test.firstSelected.dy
              , x2 = parseInt(el.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.xCoordinate) + el.dx
              , y2 = parseInt(el.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.yCoordinate) + el.dy;
            var strPath = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
            console.log(strPath);
            var shape = test.paper.path(strPath).attr("fill", fillColor);
            test.connecting = false;
          }
          

        }

      });
    });

    // LINK THE ACTIVITIES TO THE TRANSITIONS
    globalPaper.forEach(function (transition){
      
      // IF IT'S A TRANSITION
      if(transition.shapeType === 'Transition'){

        // LOOK FOR THE ID OF ELEMENTS LINKED TO THAT TRANSITION
        for(var i in transition.linkedElements){

          // FIND ELEMENT LINKED FROM AND LINK
          globalPaper.forEach(function (el){

            if(el.hasOwnProperty('associatedXPDL') && transition.associatedXPDL.From === el.associatedXPDL.Id){
              transition.linkedFromElement = el;
              // LINK THE OTHER WAY AROUND (ELEMENT -> TRANSITIONS)
              el.transitionLinkedFrom = transition;
              return false;

            }

          });

          // FIND ELEMENT LINKED TO AND LINK
          globalPaper.forEach(function (el){

            if(el.hasOwnProperty('associatedXPDL') && transition.associatedXPDL.To === el.associatedXPDL.Id){
              transition.linkedToElement = el;
              // LINK THE OTHER WAY AROUND (ELEMENT -> TRANSITIONS)
              el.transitionLinkedTo = transition;
              return false;

            }

          });

        }

      }
    });

    // MAKE ELEMENTS (NOT LINES) DRAGGABLE
    this.paper.forEach(function (el){
      console.log('here');
      if(el.type !== 'Transition'){
        this.moveElement(el);
        this.enableContextMenu(el);
      }
    }, this);
  },

  clear: function() {
    this.paper.clear();
  },

  enableContextMenu: function(element) {
    var contextMenu = $('#editor-contextmenu');
    $(element[0]).on('contextmenu', function(e) {
      contextMenu.css({
        display: "block",
        left: e.pageX,
        top: e.pageY
      });
      contextMenu.on('click', 'a', function() {
        // Remove element from paper and hide contextmenu
        $(element[0]).remove();
        contextMenu.hide();
      });
      $('body:not(#editor-contextmenu)').click(function() {
        contextMenu.hide();
      });
      return false;
    });
  },

  moveElement : function(element) {
    var start = function() {
      this.odx = 0;
      this.ody = 0;
    },
    move = function(dx, dy) {
      this.translate(dx - this.odx, dy - this.ody);
      

      if (this.pair){
        this.pair.translate(dx - this.odx, dy - this.ody);
        this.pair.odx = this.pair.attr("dx");
        this.pair.ody = this.pair.attr("dy");

      }
      this.odx = dx;
      this.ody = dy;
      //
    },
    up = function () {
    };
    
    this.enableContextMenu(element);  // for new elements added
    element.drag(move, start, up);  
  },

  getById : function(id){



  },

  paintTransition : function(transition, xOrigin, yOrigin, xCoordinates, yCoordinates, borderColor, linkedElements){
    var stringPath = "M"+xOrigin+","+yOrigin;

    for(var i in xCoordinates){
      stringPath += "L"+xCoordinates[i]+","+yCoordinates[i];
    }
    var shape = this.paper.path(stringPath);

    shape.linkedElements = linkedElements;

    shape.associatedXPDL = transition;

    shape.shapeType = 'Transition';

    $(shape.node).attr('border', borderColor);
    

    return shape;
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
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    shape.associatedXPDL = xpdlEvent;

    shape.shapeType = 'Event';
    var cssClass = "";
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor);
    
    return shape;
  },

  paintImplementation : function(xpdlImplementation, x, y, width, height, name, fillColor, borderColor){
    // paint shape
    var shape = this.paper.rect(x, y, width, height, 5);
    shape.associatedXPDL = xpdlImplementation;
    shape.shapeType = 'Implementation';

    // add text
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
    
    var shape = this.paper.path(strPath).attr("fill", fillColor);
    shape.associatedXPDL = xpdlRoute;
    console.log(shape.associatedXPDL);
    shape.shapeType = 'Route';
    var text = this.paper.text(x+width/2,y+height/2,name);
    text.shapeType = 'Text';

    // PAIRING SHAPE AND TEXT
    shape.pair = text;
    text.pair = shape;
    return shape;
    
  },
 
  getCss: function(bpmnElement, cssClass){
    for(i in this.highlighted){
      if(this.highlighted[i] == bpmnElement){
        cssClass += "-high";
        break;
      }
    }
    return cssClass;
  }
};      
