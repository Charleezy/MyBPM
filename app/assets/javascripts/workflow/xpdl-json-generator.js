
// Intended to be static class - don't instantiate.
// Feel free to modify as I'm not sure the proper way to do this in javascript.
var XpdlJsonGenerator = function() {}

// Example usage:
// XpdlJsonGenerator.getNewWorkflowJson('My Simple Workflow')
XpdlJsonGenerator.getNewWorkflowJson = function(workflowName) {
  var now = new Date();
  return JSON.stringify({
    Package: {
      PackageHeader: {
        XPDLVersion: "2.2",
        Vendor: "Bizagi Process Modeler.",
        Created: now,
        ModificationDate: now,
        Description: "Diagram 1",
        Documentation: null
      },
      RedefinableHeader: {
        Author: "ECE450",
        Version: "1.0",
        Countrykey: "CO"
      },
      ExternalPackages: null,
      Pools: {},
      Associations: null,
      Artifacts: null,
      WorkflowProcesses: {},
      ExtendedAttributes: null,
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      Id: UUID.generate(),
      Name: workflowName,
      xmlns: "http://www.wfmc.org/2009/XPDL2.2"
    }
  });
}

//===========================================================================
//  Events
//===========================================================================

// TODO consider using UUID.generate() instead of passing in id
XpdlJsonGenerator.getNewStartEventJson = function(id, x, y) {
  return JSON.stringify({
    Description: null,
    Event: {
      StartEvent: {
        Trigger: "None"
      },
    },
    Documentation: null,
    NodeGraphicsInfos: {
      NodeGraphicsInfo: {
        Coordinates: {
          XCoordinate: x,
          YCoordinate: y
        },
        ToolId: "ECE450_Workflow_Modeler",
        Height: "30",
        Width: "30",
        BorderColor: "black",
        FillColor: "green"
      }
    },
    ExtendedAttributes: null,
    Id: id,
    Name: "StartEvent"
  });
}

XpdlJsonGenerator.getNewIntermediateEventJson = function(id, x, y) {
  return JSON.stringify({
    Description: null,
    Event: {
      IntermediateEvent: {
        Trigger: "None"
      },
    },
    Documentation: null,
    NodeGraphicsInfos: {
      NodeGraphicsInfo: {
        Coordinates: {
          XCoordinate: x,
          YCoordinate: y
        },
        ToolId: "ECE450_Workflow_Modeler",
        Height: "30",
        Width: "30",
        BorderColor: "black",
        FillColor: "yellow"
      }
    },
    ExtendedAttributes: null,
    Id: id,
    Name: "IntermediateEvent"
  });
}

XpdlJsonGenerator.getNewEndEventJson = function(id, x, y) {
  return JSON.stringify({
    Description: null,
    Event: {
      EndEvent: {
        Trigger: "None"
      },
    },
    Documentation: null,
    NodeGraphicsInfos: {
      NodeGraphicsInfo: {
        Coordinates: {
          XCoordinate: x,
          YCoordinate: y
        },
        ToolId: "ECE450_Workflow_Modeler",
        Height: "30",
        Width: "30",
        BorderColor: "black",
        FillColor: "red"
      }
    },
    ExtendedAttributes: null,
    Id: id,
    Name: "EndEvent"
  });
}

//===========================================================================
//  Gateways
//===========================================================================

XpdlJsonGenerator.getNewGatewayJson = function(id, x, y) {
  // TODO seems like this is missing some properties...
  // TODO what is route?
  return JSON.stringify({
    Description: null,
    Route: null,
    Documentation: null,
    NodeGraphicsInfos: {
      NodeGraphicsInfo: {
        Coordinates: {
          XCoordinate: x,
          YCoordinate: y
        },
        ToolId: "ECE450_Workflow_Modeler",
        Height: "40",
        Width: "40",
        BorderColor: "black",
        FillColor: "yellow"
      }
    },
    ExtendedAttributes: null,
    Id: id,
    Name: "Gateway"
  });
}

//===========================================================================
//  Tasks
//===========================================================================

XpdlJsonGenerator.getNewTaskJson = function(id, x, y) {
  // TODO what about value of Task?
  return JSON.stringify({
    Description: null,
    Implementation: {
      Task: null
    },
    Performers: null,
    Documentation: null,
    Loop: {
      LoopType: "None"
    },
    NodeGraphicsInfos: {
      NodeGraphicsInfo: {
        Coordinates: {
          XCoordinate: x,
          YCoordinate: y
        },
        ToolId: "ECE450_Workflow_Modeler",
        Height: "60",
        Width: "90",
        BorderColor: "black",
        FillColor: "blue"
      }
    },
    ExtendedAttributes: null,
    Id: id,
    Name: "Task"
  });
}

//===========================================================================
//  Pools
//===========================================================================

XpdlJsonGenerator.getNewPoolJson = function(id, name, x, y) {
  // TODO what about values of Lanes & Process?
  return JSON.stringify({
    Lanes: null,
    NodeGraphicsInfos: {
      NodeGraphicsInfo: {
        Coordinates: {
          XCoordinate: x,
          YCoordinate: y
        },
        ToolId: "BizAgi_Process_Modeler",
        Height: "0",
        Width: "0",
        BorderColor: "black",
        FillColor: "cornflowerblue"
      }
    },
    Id: id,
    Name: name,
    Process: null,
    BoundaryVisible: "false"
  });
}

