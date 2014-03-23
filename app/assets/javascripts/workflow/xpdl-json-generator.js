
// Intended to be static class - don't instantiate.
// Feel free to modify as I'm not sure the proper way to do this in javascript.
var XpdlJsonGenerator = function() {}

XpdlJsonGenerator.getNewWorkflowJson = function(workflowName) {
    var now = new Date();
    return JSON.stringify({
          "Package": {
            "PackageHeader": {
              "XPDLVersion": "2.2",
              "Vendor": "Bizagi Process Modeler.",
              "Created": now,
              "ModificationDate": now,
              "Description": "Diagram 1",
              "Documentation": null
            },
            "RedefinableHeader": {
              "Author": "Thiago",
              "Version": "1.0",
              "Countrykey": "CO"
            },
            "ExternalPackages": null,
            "Pools": {},
            "Associations": null,
            "Artifacts": null,
            "WorkflowProcesses": {},
            "ExtendedAttributes": null,
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
            "Id": UUID.generate(),
            "Name": workflowName,
            "xmlns": "http://www.wfmc.org/2009/XPDL2.2"
          }
        });
}

// XpdlJsonGenerator.getNewWorkflowJson = function(workflowName)