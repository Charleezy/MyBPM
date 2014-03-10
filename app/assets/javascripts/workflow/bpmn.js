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
net.BpmnJS = function(canvas, highlighted){

  // List of element ids for highlighting
  this.highlighted = highlighted;
  
  // Paint canvas
  this.paper = Raphael(canvas, canvas.clientWidth, canvas.clientHeight);

  // BPMNDI namespace name
  this.bpmndi = "unknown";
};

// Shared functions
net.BpmnJS.prototype = {

  plot: function(jsonObject){
    
    // PAINT
    for(var i=0; i<jsonObject.Package.WorkflowProcesses.WorkflowProcess.length; i++){
      
      // TRANSITIONS
      if(jsonObject.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Transitions')){
        var transitions = jsonObject.Package.WorkflowProcesses.WorkflowProcess[i].Transitions.Transition;
        for(var j=0; j<transitions.length; j++){
          console.log('painting transition ' + j);
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
          this.paintTransition(transition, xOrigin, yOrigin, xCoordinates, yCoordinates, borderColor);
        }
      }

      // ACTIVITIES
      if(jsonObject.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Activities')){
        var activities = jsonObject.Package.WorkflowProcesses.WorkflowProcess[i].Activities.Activity;
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

    //Allows elements to be draggable
    this.moveElement();
  },

  moveElement : function(){
     var  start = function () {
            this.odx = 0;
            this.ody = 0;
          },
          move = function (dx, dy) {
            this.translate(dx - this.odx, dy - this.ody);
            this.odx = dx;
            this.ody = dy;
            //console.log('Testing1: dx:' + dx + " dy: "+ dy+' ox:' + this.odx + " oy: "+ this.ody);
          },
          up = function () {
          };
    
    this.paper.forEach(function(el){
        el.drag(move, start, up)    
    });
  },

  paintTransition : function(transition, xOrigin, yOrigin, xCoordinates, yCoordinates, borderColor){
    var stringPath = "M"+xOrigin+","+yOrigin;

    for(var i in xCoordinates){
      stringPath += "L"+xCoordinates[i]+","+yCoordinates[i];
    }

    console.log('string = ' + stringPath);

    var shape = this.paper.path(stringPath);

    $(shape.node).attr('border', borderColor);
  },
  
  paintActivity : function(activity, x, y, height, width, borderColor, fillColor, name){
    for(var activityProperty in activity)
    {
      console.log(activityProperty);
      switch(activityProperty){
        
        case 'Event':
          this.paintEvent(x,y,width, height, name, fillColor, borderColor);
          break;

        case 'Implementation':

          if(activity.Implementation.hasOwnProperty('Task'))
            this.paintImplementation(x,y,width,height, name, fillColor, borderColor);
          
          break;

        case 'Route':
            this.paintRoute(x,y,width,height, name, fillColor, borderColor);
          break;
      }
    }
  },

  paintEvent : function(x, y, width, height, name, fillColor, borderColor){
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    var cssClass = "";
    console.log(fillColor);
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor); 
  },

  paintImplementation : function(x, y, width, height, name, fillColor, borderColor){
    // paint shape
    var shape = this.paper.rect(x, y, width, height, 5);

    // add text
    this.paper.text(x+width/2,y+height/2,name);

    // add interactivity
    //shape.hover(function(){shape.transform('S1.2')},function(){shape.transform('S1')})
    //shape.click(function(){alert(name)});

    // apply cssClass
    var cssClass = "";
    $(shape.node).attr("class",cssClass);
    $(shape.node).attr("fill",fillColor); 
    $(shape.node).attr("border",borderColor); 
  },

  paintRoute : function(x, y, width, height, name, fillColor, borderColor){
    var shape = this.paper.rect(x, y, width, height, 1);
    shape.transform('r45');
    this.paper.text(x+width/2,y+height/2,name);

    $(shape.node).attr("fill", fillColor);
    $(shape.node).attr("border",borderColor);
  },
 
  paintEdge : function(docRoot, bpmnElement, path, x, y){
    var element = docRoot.selectNodeSet("//*[@id="+bpmnElement+"]").item(0);
    var name = this.getElementName(element);
    
    var path = this.paper.path(path);
    if(element.localName == "messageFlow"){
      $(path.node).attr("stroke-dasharray","5,5");
    }
    path.attr({'arrow-end':'block-wide-long'});
    var css = "";
    $(path.node).attr("class",css);
    this.paper.text(x+15,y+10,name);
  },
  
  paintParticipant : function(x, y, width, height,element){
    var name = this.getElementName(element);
    var shape = this.paper.rect(x, y, width, height);
    $(shape.node).attr("class","participant");
    this.paper.text(x+15,y+height/2,name).transform("r270");
  },
  paintLane : function(x, y, width, height,element){
    var shape = this.paper.rect(x, y, width, height);
    $(shape.node).attr("class","lane");
  },
  paintExclusiveGateway : function(x, y, width, height,element){
    var name = this.getElementName(element);
    var h2 = height/2;
    var w2 = width/2;     
    var w = width;
    var h = height;
    var path = "M"+(x+w2) + " " + (y) + "L"+(x+w) + " " +(y+h2) + "L"+(x+w2) + " " +(y+h) + "L"+(x) + " " +(y+h2) + "L"+(x+w2) + " " +(y);
    var shape = this.paper.path(path);
    this.paper.text(x+width/2,y+height/2,'X').attr({'font-size':16,'font-weight':'bold'});
    this.paper.text(x+width/2,y-10,name);
    $(shape.node).attr("class","exclusiveGateway");
  },

  paintBoundaryEvent : function(x, y, width, height,element){
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    $(shape.node).attr("class","boundaryEvent");
  }, 

  paintReceiveTask : function(x, y, width, height, element, elementType, bpmnElement){
    // draw task shape
    this.paintTask(x, y, width, height, element, elementType, bpmnElement);
    // draw envelope
    this.paper.rect(x+10, y+10,20, 15);
    this.paper.path("M"+(x+10)+" "+(y+10)+"L"+(x+20)+" "+(y+20)+ "L" +(x+30)+" "+(y+10));
  },
  paintSendTask : function(x, y, width, height, element, elementType, bpmnElement){
    this.paintTask(x, y, width, height, element, elementType, bpmnElement);
    this.paper.rect(x+10, y+10,20, 15).attr("fill","black");
    this.paper.path("M"+(x+10)+" "+(y+10)+"L"+(x+20)+" "+(y+20)+ "L" +(x+30)+" "+(y+10)).attr("stroke","white");
  },
  paintSubProcess : function(x, y, width, height,element){
    var shape = this.paper.rect(x, y, width, height, 5);
    $(shape.node).attr("class","subProcess");
  },
  paintDataStoreReference : function(x, y, width, height,element){
    var shape = this.paper.rect(x, y, width, height, 5);
    $(shape.node).attr("class","dataStoreReference");
  },
  paintTextAnnotation : function(x, y, width, height,element){
    var shape = this.paper.rect(x, y, width, height);
    var text = element.getFirstChild().getFirstChild().getNodeValue();
    var re = new RegExp(' ', 'g');
    text = text.replace(re,'\n');
    this.paper.text(x+width/2,y+height/2,text).attr({'font-size':8});
    $(shape.node).attr("class","textAnnotation");
    $(this.paper.path("M"+x + " " + y + "L"+(x+width/2) + " " +y).node).attr("stroke-dasharray","5,5");
    $(this.paper.path("M"+x + " " + y + "L"+ x + " " +(y+height/2)).node).attr("stroke-dasharray","5,5");
  },
  paintDefault : function(x, y, width, height,element){
    var shape = this.paper.rect(x, y, width, height, 5);
    this.paper.text(x+5,y+5,element.localName);
    $(shape.node).attr("class","shape");
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
