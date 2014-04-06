
// Intended to be static class - don't instantiate.
// Feel free to modify as I'm not sure the proper way to do this in javascript.
var XpdlJsonGenerator = function() {}

// Example "xpdl:usage":
// XpdlJsonGenerator.getNewWorkflowJson('My Simple Workflow')
XpdlJsonGenerator.getNewWorkflowJson = function(id, workflowName) {
  var now = new Date();
  return    {
              "xmlns:xpdl": "http://www.wfmc.org/2008/XPDL2.1",
              "xmlns": "http://www.wfmc.org/2008/XPDL2.1",
              "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
              "Id": "workflow_patterns",
              "Name": "Default Name",
              "xsi:schemaLocation": "http://www.wfmc.org/2008/XPDL2.1 http://www.wfmc.org/standards/docs/bpmnxpdl_31.xsd",
              "PackageHeader": [
                {
                  "XPDLVersion": [
                    "2.1"
                  ],
                  "Vendor": [
                    "ECE451_Tool"
                  ],
                  "Created": [
                    String(now)
                  ],
                  "Description": [
                    "Workflow Description"
                  ]
                }
              ],
              "RedefinableHeader": [
                {
                  "PublicationStatus": "UNDER_TEST",
                  "Author": [
                    "Sasa Bojanic"
                  ]
                }
              ],
              "ConformanceClass": [
                {
                  "GraphConformance": "NON_BLOCKED"
                }
              ],
              "Script": [
                {
                  "Type": "text/javascript"
                }
              ],
              "Participants": [
                {
                  "Participant": [
                    {
                      "Id": "test",
                      "Name": "Test",
                      "ParticipantType": [
                        {
                          "Type": "ROLE"
                        }
                      ]
                    }
                  ]
                }
              ],
              "Applications": [
                {
                  "Application": [
                    {
                      "Id": "ResetCounter",
                      "FormalParameters": [
                        {
                          "FormalParameter": [
                            {
                              "Id": "counter",
                              "IsArray": "false",
                              "Mode": "OUT",
                              "DataType": [
                                {
                                  "BasicType": [
                                    {
                                      "Type": "INTEGER"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ],
                      "ExtendedAttributes": [
                        {
                          "ExtendedAttribute": [
                            {
                              "Name": "ToolAgentClass",
                              "Value": "org.enhydra.shark.toolagent.JavaScriptToolAgent"
                            },
                            {
                              "Name": "Script",
                              "Value": "counter = 0;"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "Id": "IncrementCounter",
                      "FormalParameters": [
                        {
                          "FormalParameter": [
                            {
                              "Id": "counter",
                              "IsArray": "false",
                              "Mode": "INOUT",
                              "DataType": [
                                {
                                  "BasicType": [
                                    {
                                      "Type": "INTEGER"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ],
                      "ExtendedAttributes": [
                        {
                          "ExtendedAttribute": [
                            {
                              "Name": "ToolAgentClass",
                              "Value": "org.enhydra.shark.toolagent.JavaScriptToolAgent"
                            },
                            {
                              "Name": "Script",
                              "Value": "counter = counter + 1;"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "Id": "DecrementCounter",
                      "FormalParameters": [
                        {
                          "FormalParameter": [
                            {
                              "Id": "counter",
                              "IsArray": "false",
                              "Mode": "INOUT",
                              "DataType": [
                                {
                                  "BasicType": [
                                    {
                                      "Type": "INTEGER"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ],
                      "ExtendedAttributes": [
                        {
                          "ExtendedAttribute": [
                            {
                              "Name": "ToolAgentClass",
                              "Value": "org.enhydra.shark.toolagent.JavaScriptToolAgent"
                            },
                            {
                              "Name": "Script",
                              "Value": "counter = counter - 1;"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "Id": "SetCounter",
                      "FormalParameters": [
                        {
                          "FormalParameter": [
                            {
                              "Id": "value",
                              "IsArray": "false",
                              "Mode": "IN",
                              "DataType": [
                                {
                                  "BasicType": [
                                    {
                                      "Type": "INTEGER"
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              "Id": "counter",
                              "IsArray": "false",
                              "Mode": "OUT",
                              "DataType": [
                                {
                                  "BasicType": [
                                    {
                                      "Type": "INTEGER"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ],
                      "ExtendedAttributes": [
                        {
                          "ExtendedAttribute": [
                            {
                              "Name": "ToolAgentClass",
                              "Value": "org.enhydra.shark.toolagent.JavaScriptToolAgent"
                            },
                            {
                              "Name": "Script",
                              "Value": "counter = value;"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ],
              "DataFields": [
                {
                  "DataField": [
                    {
                      "Id": "whereToGo",
                      "IsArray": "false",
                      "Name": "Where to go",
                      "DataType": [
                        {
                          "BasicType": [
                            {
                              "Type": "STRING"
                            }
                          ]
                        }
                      ],
                      "InitialValue": [
                        "B"
                      ],
                      "Description": [
                        "The value of this variable determines the process flow."
                      ]
                    }
                  ]
                }
              ],
              "Pools": [
                {
                  "Pool": []
                }
              ],
              "WorkflowProcesses": [
                {
                  "WorkflowProcess": [
                    {
                      "AccessLevel": "PUBLIC",
                      "Id": id,
                      "Name": workflowName,
                      "ProcessHeader": [
                        {
                          "DurationUnit": "D",
                          "Created": [
                            "2004-08-31 22:28:17"
                          ],
                          "Description": [
                            "execute activities A, B and C in sequence"
                          ]
                        }
                      ],
                      "RedefinableHeader": [
                        {
                          "PublicationStatus": "UNDER_TEST",
                          "Author": [
                            "Default Author"
                          ]
                        }
                      ],
                      "Activities": [],
                      "Transitions": []
                    }
                  ]
                }
              ],
              "ExtendedAttributes": [
                {
                  "ExtendedAttribute": [
                    {
                      "Name": "EDITING_TOOL",
                      "Value": "ECE451_Workflow_Tool"
                    },
                    {
                      "Name": "EDITING_TOOL_VERSION",
                      "Value": "0.00001_alpha"
                    },
                  ]
                }
              ]
            };
}
// FIXIT
// WE ARE NOT DEFINING TO WITCH POOLS OR LANES THE ELEMENTS BELONG
//===========================================================================
//  Events
//===========================================================================

// FIXIT
// ALL PROPERTIES SHOULD BE STRINGS
XpdlJsonGenerator.getNewStartEventJson = function(id, x, y) {
  return  {
            "Name":"StartEvent",
            "Id": id,
            "Event": [
              {
                "StartEvent": [
                  {
                    "Trigger": "None"
                  }
                ]
              }
            ],
            "NodeGraphicsInfos": [
              {
                "NodeGraphicsInfo": [
                  {
                    "BorderColor": "black",
                    "FillColor": "green",
                    "Height": "30",
                    "IsVisible": "true",
                    "LaneId": "DefaultLane",
                    "ToolId": "ECE451_Workflow_Tool",
                    "Width": "30",
                    "Coordinates": [
                      {
                        "XCoordinate": x,
                        "YCoordinate": y
                      }
                    ]
                  }
                ]
              }
            ]
          };
}

XpdlJsonGenerator.getNewIntermediateEventJson = function(id, x, y) {
  return  {
            "Id": id,
            "Name": "IntermediateEvent",
            "Event": [
              {
                "IntermediateEvent": [
                  {
                    "Trigger": "None"
                  }
                ]
              }
            ],
            "NodeGraphicsInfos": [
              {
                "NodeGraphicsInfo": [
                  {
                    "BorderColor": "black",
                    "FillColor": "yellow",
                    "Height": "30",
                    "IsVisible": "true",
                    "LaneId": "DefaultLane",
                    "ToolId": "ECE451_Workflow_Tool",
                    "Width": "30",
                    "Coordinates": [
                      {
                        "XCoordinate": x,
                        "YCoordinate": y
                      }
                    ]
                  }
                ]
              }
            ]
          };
}

XpdlJsonGenerator.getNewEndEventJson = function(id, x, y) {
  return  {
            "Id": id,
            "Name": "EndEvent",
            "Event": [
              {
                "EndEvent": [
                  {
                    "Trigger": "None"
                  }
                ]
              }
            ],
            "NodeGraphicsInfos": [
              {
                "NodeGraphicsInfo": [
                  {
                    "BorderColor": "black",
                    "FillColor": "red",
                    "Height": "30",
                    "IsVisible": "true",
                    "LaneId": "DefaultLane",
                    "ToolId": "ECE451_Workflow_Tool",
                    "Width": "30",
                    "Coordinates": [
                      {
                        "XCoordinate": x,
                        "YCoordinate": y
                      }
                    ]
                  }
                ]
              }
            ]
          };
}

//===========================================================================
//  Gateways
//===========================================================================

XpdlJsonGenerator.getNewGatewayJson = function(id, x, y) {
  // TODO seems like this is missing some properties...
  // TODO what is route?
  // FIXIT
  // WE ARE ASSUMING THAT EVERY GATEWAY IS EXCLUSIVE
  return  {
            "Id": id,
            "Name": "X",
            "Route":[
              {
                "GatewayType":"Exclusive" 
              }
            ],
            "NodeGraphicsInfos": [
              {
                "NodeGraphicsInfo": [
                  {
                    "BorderColor": "black",
                    "FillColor": "yellow",
                    "Height": "40",
                    "IsVisible": "true",
                    "LaneId": "DefaultLane",
                    "ToolId": "ECE451_Workflow_Tool",
                    "Width": "40",
                    "Coordinates": [
                      {
                        "XCoordinate": x,
                        "YCoordinate": y
                      }
                    ]
                  }
                ]
              }
            ]
          };
}

//===========================================================================
//  Tasks
//===========================================================================

XpdlJsonGenerator.getNewTaskJson = function(id, x, y) {
  // TODO what about value of Task?
  return  {
            "Id": id,
            "Name": "Task",
            "Description": [
              "DefaultDescription"
            ],
            "Implementation": [
              {
                "No": [
                  {}
                ]
              }
            ],
            "Performers": [
              {
                "Performer": [
                  "test"
                ]
              }
            ],
            "NodeGraphicsInfos": [
              {
                "NodeGraphicsInfo": [
                  {
                    "BorderColor": "black",
                    "FillColor": "white",
                    "Height": "60",
                    "IsVisible": "true",
                    "LaneId": "DefaultLane",
                    "ToolId": "ECE451_Workflow_Tool",
                    "Width": "90",
                    "Coordinates": [
                      {
                        "XCoordinate": x,
                        "YCoordinate": y
                      }
                    ]
                  }
                ]
              }
            ]  
          };
}

//===========================================================================
//  Pools
//===========================================================================

XpdlJsonGenerator.getNewPoolJson = function(id, name, x, y) {
  // TODO what about values of Lanes & Process?
  return  {
            "BoundaryVisible": "true",
            "Id": id,
            "MainPool": "true",
            "Name": name,
            "Orientation": "HORIZONTAL",
            "Process": "DefaultProcess",
            "Lanes": [
              {
                "Lane": []
              }
            ],
            "NodeGraphicsInfos": [
              {
                "NodeGraphicsInfo": [
                  {
                    "BorderColor": "black",
                    "FillColor": "white",
                    "IsVisible": "true",
                    "ToolId": "ECE451_Workflow_Tool"
                  }
                ]
              }
            ]
          
          };
}

//===========================================================================
//  Lanes
//===========================================================================

XpdlJsonGenerator.getNewLaneJson = function(id, name, x, y) {
  // TODO 
  // FINISH THAT
  return  {

          };
}

//===========================================================================
//  Transitions
//===========================================================================

XpdlJsonGenerator.getNewTransitionJson = function(id, name, from, to) {
  return  {
            "From": from,
            "Id": id,
            "Name": name,
            "To": to,
            "ConnectorGraphicsInfos": [
              {
                "ConnectorGraphicsInfo": [
                  {
                    "FillColor": "white",
                    "IsVisible": "true",
                    "Style": "NO_ROUTING_ORTHOGONAL",
                    "ToolId": "ECE451_Workflow_Tool"
                  }
                ]
              }
            ]
          };
}
