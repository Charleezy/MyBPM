
// Intended to be static class - don't instantiate.
// Feel free to modify as I'm not sure the proper way to do this in javascript.
var XpdlJsonGenerator = function() {}

// Example "xpdl:usage":
// XpdlJsonGenerator.getNewWorkflowJson('My Simple Workflow')
XpdlJsonGenerator.getNewWorkflowJson = function(workflowName) {
  var now = new Date();
  return {
    "xpdl:Package": {
      "xpdl:PackageHeader": {
        "xpdl:XPDLVersion": "2.2",
        "xpdl:Vendor": "Bizagi Process Modeler.",
        "xpdl:Created": now,
        "xpdl:ModificationDate": now,
        "xpdl:Description": "Diagram 1",
        "xpdl:Documentation": null
      },
      "xpdl:RedefinableHeader": {
        "xpdl:Author": "ECE450",
        "xpdl:Version": "1.0",
        "xpdl:Countrykey": "CO"
      },
      "xpdl:ExternalPackages": null,
      "xpdl:Pools": {},
      "xpdl:Associations": null,
      "xpdl:Artifacts": null,
      "xpdl:WorkflowProcesses": {},
      "xpdl:ExtendedAttributes": null,
      "xpdl:xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xpdl:xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      Id: UUID.generate(),
      Name: workflowName,
      "xpdl:xmlns": "http://www.wfmc.org/2009/XPDL2.2"
    }
  };
}

//===========================================================================
//  Events
//===========================================================================

// TODO consider using UUID.generate() instead of passing in id
XpdlJsonGenerator.getNewStartEventJson = function(id, x, y) {
  return  {
            "xpdl:Description": null,
            "xpdl:Event": {
              "xpdl:StartEvent": {
                "xpdl:Trigger": "None"
              },
            },
            "xpdl:Documentation": null,
            "xpdl:NodeGraphicsInfos": {
              "xpdl:NodeGraphicsInfo": {
                "xpdl:Coordinates": {
                  XCoordinate: x,
                  YCoordinate: y
                },
                "xpdl:ToolId": "ECE450_Workflow_Modeler",
                Height: "30",
                Width: "30",
                BorderColor: "black",
                FillColor: "green"
              }
            },
            "xpdl:ExtendedAttributes": null,
            Id: id,
            Name: "StartEvent"
          };
}

XpdlJsonGenerator.getNewIntermediateEventJson = function(id, x, y) {
  return  {
            "xpdl:Description": null,
            "xpdl:Event": {
              "xpdl:IntermediateEvent": {
                "xpdl:Trigger": "None"
              },
            },
            "xpdl:Documentation": null,
            "xpdl:NodeGraphicsInfos": {
              "xpdl:NodeGraphicsInfo": {
                "xpdl:Coordinates": {
                  XCoordinate: x,
                  YCoordinate: y
                },
                "xpdl:ToolId": "ECE450_Workflow_Modeler",
                Height: "30",
                Width: "30",
                BorderColor: "black",
                FillColor: "yellow"
              }
            },
            "xpdl:ExtendedAttributes": null,
            Id: id,
            Name: "IntermediateEvent"
          };
}

XpdlJsonGenerator.getNewEndEventJson = function(id, x, y) {
  return  {
            "xpdl:Description": null,
            "xpdl:Event": {
              "xpdl:EndEvent": {
                "xpdl:Trigger": "None"
              },
            },
            "xpdl:Documentation": null,
            "xpdl:NodeGraphicsInfos": {
              "xpdl:NodeGraphicsInfo": {
                "xpdl:Coordinates": {
                  XCoordinate: x,
                  YCoordinate: y
                },
                "xpdl:ToolId": "ECE450_Workflow_Modeler",
                Height: "30",
                Width: "30",
                BorderColor: "black",
                FillColor: "red"
              }
            },
            "xpdl:ExtendedAttributes": null,
            Id: id,
            Name: "EndEvent"
          };
}

//===========================================================================
//  Gateways
//===========================================================================

XpdlJsonGenerator.getNewGatewayJson = function(id, x, y) {
  // TODO seems like this is missing some properties...
  // TODO what is route?
  return  {
            "xpdl:Description": null,
            "xpdl:Route": null,
            "xpdl:Documentation": null,
            "xpdl:NodeGraphicsInfos": {
              "xpdl:NodeGraphicsInfo": {
                "xpdl:Coordinates": {
                  XCoordinate: x,
                  YCoordinate: y
                },
                "xpdl:ToolId": "ECE450_Workflow_Modeler",
                Height: "40",
                Width: "40",
                BorderColor: "black",
                FillColor: "yellow"
              }
            },
            "xpdl:ExtendedAttributes": null,
            Id: id,
            Name: "Gateway"
          };
}

//===========================================================================
//  Tasks
//===========================================================================

XpdlJsonGenerator.getNewTaskJson = function(id, x, y) {
  // TODO what about value of Task?
  return  {
            "xpdl:Description": null,
            "xpdl:Implementation": {
              "xpdl:Task": null
            },
            "xpdl:Performers": null,
            "xpdl:Documentation": null,
            "xpdl:Loop": {
              "xpdl:LoopType": "None"
            },
            "xpdl:NodeGraphicsInfos": {
              "xpdl:NodeGraphicsInfo": {
                "xpdl:Coordinates": {
                  XCoordinate: x,
                  YCoordinate: y
                },
                "xpdl:ToolId": "ECE450_Workflow_Modeler",
                Height: "60",
                Width: "90",
                BorderColor: "black",
                FillColor: "blue"
              }
            },
            "xpdl:ExtendedAttributes": null,
            Id: id,
            Name: "Task"
          };
}

//===========================================================================
//  Pools
//===========================================================================

XpdlJsonGenerator.getNewPoolJson = function(id, name, x, y) {
  // TODO what about values of Lanes & Process?
  return  {
            "xpdl:Lanes": null,
            "xpdl:NodeGraphicsInfos": {
              "xpdl:NodeGraphicsInfo": {
                "xpdl:Coordinates": {
                  XCoordinate: x,
                  YCoordinate: y
                },
                "xpdl:ToolId": "BizAgi_Process_Modeler",
                Height: "0",
                Width: "0",
                BorderColor: "black",
                FillColor: "cornflowerblue"
              }
            },
            Id: id,
            Name: name,
            "xpdl:Process": null,
            "xpdl:BoundaryVisible": "false"
          };
}

//===========================================================================
//  Transitions
//===========================================================================

XpdlJsonGenerator.getNewTransitionJson = function(id, name, from, to) {
  return  {
            From:from,
            Id:id,
            Name:name,
            To:to,
            "xpdl:ConnectorGraphicsInfos": {
              "xpdl:ConnectorGraphicsInfo": {
                FillColor:"white",
                IsVisible:"true",
                Style:"NO_ROUTING_ORTHOGONAL",
                ToolId:"ECE450_Workflow_Modeler"
              }
            }
          };
}
