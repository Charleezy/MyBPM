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

function assert(condition, message) {
  if (!condition) {
      throw message || "Assertion failed";
  }
}
        
// Constructor
net.BpmnJS = function(xpdlJson, canvas){

  this.xpdlJson = xpdlJson;

  // Paint canvas
  this.paper = Raphael(canvas, canvas.clientWidth, canvas.clientHeight);
  this.connections = [];
  this.isConnecting = false;
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

    // var test = this;

    // globalPaper.forEach(function (el){
    //   el.click(function(){
    //     // console.log(test.connecting);
    //     if(test.connecting){
    //       console.log('connecting');
    //       console.log('firstSelected:',test.firstSelected);
    //       if(test.firstSelected === false || test.firstSelected === undefined){
    //         console.log('first not selected');
    //         test.firstSelected = el;
    //       }
    //       else{
    //         console.log('first selected');
    //         test.firstSelected = false;
    //         console.log(el.associatedXPDL);
    //         console.log(test.firstSelected.associatedXPDL);
    //         var x1 = parseInt(test.firstSelected.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.xCoordinate) + test.firstSelected.dx
    //           , y1 = parseInt(test.firstSelected.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.yCoordinate) + test.firstSelected.dy
    //           , x2 = parseInt(el.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.xCoordinate) + el.dx
    //           , y2 = parseInt(el.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.yCoordinate) + el.dy;
    //         var strPath = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
    //         console.log(strPath);
    //         var shape = test.paper.path(strPath).attr("fill", fillColor);
    //         test.connecting = false;
    //       }
          

    //     }

    //   });
    // });

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
      if(el.type !== 'Transition'){
        this.moveElement(el);
        this.enableContextMenu(el[0]);
      }
    }, this);
  },

  clear: function() {
    this.paper.clear();
  },

  enableContextMenu: function(element) {
    var contextMenu = $('#editor-contextmenu');
    $(element).on('contextmenu', function(e) {
      contextMenu.css({
        display: "block",
        left: e.pageX,
        top: e.pageY
      });
      contextMenu.on('click', 'a', function() {
        // Remove element from paper and hide contextmenu
        $(element).remove();
        contextMenu.hide();
      });
      $('body:not(#editor-contextmenu)').click(function() {
        contextMenu.off('click', 'a');
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
    var connection = this.paper.connection(element1, element2, "#000", "#000|2");
    // console.log(connection);
    // FIXME this.enableContextMenu(connection.bg[0]);
    this.connections.push(connection);
    // // We want to draw a path connecting the centers of both elements.
    // var x1 = parseInt(element1.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.XCoordinate) +
    //          parseInt(element1.dx) +
    //          parseInt(element1.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Width) / 2,
    //     y1 = parseInt(element1.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.YCoordinate) +
    //          parseInt(element1.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Height) / 2,
    //     x2 = parseInt(element2.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.XCoordinate) +
    //          parseInt(element2.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Width) / 2,
    //     y2 = parseInt(element2.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.YCoordinate) +
    //          parseInt(element2.associatedXPDL.NodeGraphicsInfos.NodeGraphicsInfo.Height) / 2;
    // // We now have the center coordinates, but we need to apply an offset for the path so that 
    // // we don't actually draw over the element.

    // var strPath = "M" + x1 + " " + y1 + "L" + x2 + " " + y2;
    // var shape = this.paper.path(strPath).attr('arrow-end','block-wide-long');
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
            this.pair.translate(dx - this.odx, dy - this.ody);
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
    
    // TODO move enableContextMenu() somewhere else...
    // this needs to be called for every element (newly added as well)
    this.enableContextMenu(element);
    element.drag(move, dragger, up);  
  },

  getById : function(id){



  },

  paintTransition : function(transition, xOrigin, yOrigin, xCoordinates, yCoordinates, borderColor, linkedElements){
    var stringPath = "M"+xOrigin+","+yOrigin;

    for(var i in xCoordinates){
      stringPath += "L"+xCoordinates[i]+","+yCoordinates[i];
    }
    var shape = this.paper.path(stringPath);
    // var shape = this.paper.path(stringPath).attr('cursor', 'move');

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
    // var shape = this.paper.circle(x+width/2, y+height/2, width/2).attr('cursor', 'move');
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
    // var shape = this.paper.rect(x, y, width, height, 5).attr('cursor', 'move');
    var shape = this.paper.rect(x, y, width, height, 5);
    shape.associatedXPDL = xpdlImplementation;
    shape.shapeType = 'Implementation';

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
    
    // var shape = this.paper.path(strPath).attr({fill: fillColor, cursor: 'move'});
    var shape = this.paper.path(strPath).attr({fill: fillColor});
    shape.associatedXPDL = xpdlRoute;
    shape.shapeType = 'Route';
    // var text = this.paper.text(x+width/2,y+height/2,name).attr('cursor', 'move');
    var text = this.paper.text(x+width/2,y+height/2,name);
    text.shapeType = 'Text';

    // PAIRING SHAPE AND TEXT
    shape.pair = text;
    text.pair = shape;
    return shape;
    
  },

  // paintEdge : function(docRoot, bpmnElement, path, x, y){
  //   var element = docRoot.selectNodeSet("//*[@id="+bpmnElement+"]").item(0);
  //   var name = this.getElementName(element);
    
  //   var path = this.paper.path(path);
  //   if(element.localName == "messageFlow"){
  //     $(path.node).attr("stroke-dasharray","5,5");
  //   }
  //   path.attr({'arrow-end':'block-wide-long'});
  //   var css = this.getCss(bpmnElement, "edge")
  //   $(path.node).attr("class",css);
  //   this.paper.text(x+15,y+10,name);
  // },

  // paintTextAnnotation : function(x, y, width, height,element){
  //   var shape = this.paper.rect(x, y, width, height);
  //   var text = element.getFirstChild().getFirstChild().getNodeValue();
  //   var re = new RegExp(' ', 'g');
  //   text = text.replace(re,'\n');
  //   this.paper.text(x+width/2,y+height/2,text).attr({'font-size':8});
  //   $(shape.node).attr("class","textAnnotation");
  //   $(this.paper.path("M"+x + " " + y + "L"+(x+width/2) + " " +y).node).attr("stroke-dasharray","5,5");
  //   $(this.paper.path("M"+x + " " + y + "L"+ x + " " +(y+height/2)).node).attr("stroke-dasharray","5,5");
  // },

  // paintDataStoreReference : function(x, y, width, height,element){
  //   var shape = this.paper.rect(x, y, width, height, 5);
  //   $(shape.node).attr("class","dataStoreReference");
  // },
 
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
