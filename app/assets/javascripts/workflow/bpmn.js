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


var test = 'hi';
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
      
      // ACTIVITIES
      if(jsonObject.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Activities')){
        var activities = jsonObject.Package.WorkflowProcesses.WorkflowProcess[i].Activities.Activity;
        for(var j=0; j<activities.length; j++){
          var activity = activities[j];
          var xCoordinate = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.XCoordinate);
          var yCoordinate = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Coordinates.YCoordinate);
          var height = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Height);
          var width = parseInt(activity.NodeGraphicsInfos.NodeGraphicsInfo.Width);
          var borderColor = activity.NodeGraphicsInfos.BorderColor;
          var fillColor = activity.NodeGraphicsInfos.FillColor;
          this.paintShape(xCoordinate, yCoordinate, height, width, borderColor,fillColor, activity);
        }
      }

      // if(jsonObject.Package.WorkflowProcesses.WorkflowProcess[i].hasOwnProperty('Transitions')){
      //   var transitions = jsonObject.Package.WorkflowProcesses.WorkflowProcess[i].Transitions.Transition;
      //   for(var j=0; j<transitions.length; j++){
      //     var transition = transitions[j];
      //     var startXCoordinate = parseInt(transition.ConnectorGraphicsInfos.ConnectorGraphicsInfo.Coordinates[0].XCoordinate);
      //     var startYCoordinate = parseInt(transition.ConnectorGraphicsInfos.ConnectorGraphicsInfo.Coordinates[0].YCoordinate);
      //     for(var k in transition.ConnectorGraphicsInfos.ConnectorGraphicsInfo.Coordinates){
      //       var XCoordinates[k] = parseInt(transition.ConnectorGraphicsInfos.ConnectorGraphicsInfo.Coordinates[k].XCoordinate);
      //       var YCoordinates[k] = parseInt(transition.ConnectorGraphicsInfos.ConnectorGraphicsInfo.Coordinates[k].YCoordinate);
      //     }
      //     var borderColor = transition.NodeGraphicsInfos.BorderColor;
      //     this.paintShape(xCoordinate, yCoordinate, height, width, borderColor,fillColor, transition);
      //   }
      // }
    }

      //this.paintEdge(docRoot, bpmnElement, path, startX, startY);
    //Allows elements to be draggable
    //this.moveElement();
  },

  paintActivity : function(x, y, height, width, borderColor, fillColor, activity){

  },

  paintTransition : function(){

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
  
  paintShape : function(x, y, height, width, borderColor, fillColor, activity){
    // GET THE NAME OF THE EVENT
    for(var eventName in activity.Event){
        switch(eventName){
        case "StartEvent":
          console.log("StartEvent");
           this.paintStartEvent(x,y,width, height);
           break;
        // case "EndEvent":
        //    this.paintEndEvent(x,y,width, height, element, element.localName, bpmnElement);
        //    break;
        // case "Participant":
        //    this.paintParticipant(x,y,width, height, element);
        //    break;
        // case "Lane":
        //    this.paintLane(x,y,width, height, element);
        //    break;
        // case "ServiceTask":
        // case "ScriptTask":
        // case "UserTask":
        // case "Task":
        //    this.paintTask(x,y,width, height, element, element.localName, bpmnElement);
        //    break;
        // case "SendTask":
        //    this.paintSendTask(x,y,width, height, element, element.localName, bpmnElement);
        //    break;
        // case "ReceiveTask":
        //    this.paintReceiveTask(x,y,width, height, element, element.localName, bpmnElement);
        //    break;
        // case "ExclusiveGateway":
        //    this.paintExclusiveGateway(x,y,width, height, element);
        //    break;
        // case "BoundaryEvent":
        //    this.paintBoundaryEvent(x,y,width, height, element);
        //    break;
        // case "SubProcess":
        //    this.paintSubProcess(x,y,width, height, element);
        //    break;
        // case "TextAnnotation":
        //    this.paintTextAnnotation(x,y,width, height, element);
        //    break;
        // case "DataStoreReference":
        //    this.paintDataStoreReference(x,y,width, height, element);
        //    break;
        default: 
           // this.paintDefault(x,y,width, height, element);
           break;
      }
    }
  
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
  paintStartEvent : function(x, y, width, height){
    console.log(width + ' ' + height);
    console.log(x);
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    var css = "";
    $(shape.node).attr("class",css);
  }, 
  paintBoundaryEvent : function(x, y, width, height,element){
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    $(shape.node).attr("class","boundaryEvent");
  }, 
  paintEndEvent : function(x, y, width, height,element, elementType, bpmnElement){
    var shape = this.paper.circle(x+width/2, y+height/2, width/2);
    var css = "";
    $(shape.node).attr("class",css);
  }, 
  paintTask : function(x, y, width, height, element, elementType, bpmnElement){
    // paint shape
    var shape = this.paper.rect(x, y, width, height, 5);
    var name = this.getElementName(element);
    // add text
    var re = new RegExp(' ', 'g');
    name = name.replace(re,'\n');
    this.paper.text(x+width/2,y+height/2,name);

    // add interactivity
    //shape.hover(function(){shape.transform('S1.2')},function(){shape.transform('S1')})
    //shape.click(function(){alert(name)});

    // apply css
    var css = "";
    $(shape.node).attr("class",css);
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
