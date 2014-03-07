require './xpdl_object'


file = File.open("/Users/abdulhaseeb/Google Drive/Projects/RailsWorkSpace/MyBPM/app/models/FlowGuide_examples_001.xpdl", "rb")
contents = file.read

schema = File.open("/Users/abdulhaseeb/Google Drive/Projects/RailsWorkSpace/MyBPM/app/models/bpmnxpdl_31.xml", "rb")
contentsSchema = schema.read

obj = XpdlObject.new(contents, contentsSchema)

obj.validate
obj.traverse
