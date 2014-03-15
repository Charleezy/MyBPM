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
var connections = [];

// Constructor
net.BpmnJS = function(xpdlJson, canvas){

  this.xpdlJson = xpdlJson;

  // Paint canvas
  this.paper = Raphael(canvas, canvas.clientWidth, canvas.clientHeight);
  var rex = this.paper.rect(10, 20, 150, 80).attr("fill", "cornflowerblue");

  var circ = this.paper.circle(250, 50, 40).attr("fill", "orange");
  connections.push(this.paper.connection(this.paper, rex, circ, "black", "#fff"))

};
Raphael.fn.connection =function (paper, obj1, obj2, line, bg) {
      if (obj1.line && obj1.from && obj1.to) {
          line = obj1;
          obj1 = line.from;
          obj2 = line.to;
      }
      var bb1 = obj1.getBBox(),
          bb2 = obj2.getBBox(),
          p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
          {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
          {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
          {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
          {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
          {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
          {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
          {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
          d = {}, dis = [];
      for (var i = 0; i < 4; i++) {
          for (var j = 4; j < 8; j++) {
              var dx = Math.abs(p[i].x - p[j].x),
                  dy = Math.abs(p[i].y - p[j].y);
              if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                  dis.push(dx + dy);
                  d[dis[dis.length - 1]] = [i, j];
              }
          }
      }
      if (dis.length == 0) {
          var res = [0, 4];
      } else {
          res = d[Math.min.apply(Math, dis)];
      }
      var x1 = p[res[0]].x,
          y1 = p[res[0]].y,
          x4 = p[res[1]].x,
          y4 = p[res[1]].y;
      dx = Math.max(Math.abs(x1 - x4) / 2, 10);
      dy = Math.max(Math.abs(y1 - y4) / 2, 10);
      var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
          y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
          x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
          y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
      var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
      if (line && line.line) {
          line.bg && line.bg.attr({path: path});
          line.line.attr({path: path});
      } else {
          var color = typeof line == "string" ? line : "#000";
          return {
              bg: bg && bg.split && paper.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
              line: paper.path(path).attr({stroke: color, fill: "none"}),
              from: obj1,
              to: obj2
          };
      }
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

    // // SHOW ALL IDs
    // this.paper.forEach(function(el){
    //   if(el.shapeType !== 'Text'){
    //     alert('hi');
    //     el.hide();
    //     
    //     
    //   }
    // });

    var globalPaper = this.paper;
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
    var func = this.moveElement;
    this.paper.forEach(function (el){
      if(el.type !== 'Transition'){
        func(el);
      }
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
      
        for (var i = connections.length; i--;){
        this.paper.connection(this.paper, connections[i])
      }
    },
    up = function () {
    };
    
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
