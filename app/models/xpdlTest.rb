require './xpdl_object'

# THIS FILE WILL TURN INTO THE 'WORKER' PRETTY SOON :)

## DEMO: This is a simple XPDL Model, without any decisions/gateways
#file = File.open("/Users/abdulhaseeb/Google Drive/Projects/RailsWorkSpace/MyBPM/app/models/workflow_pattern_simple.xml", "rb")

## DEMO: This XPDL Model, has one Exclusive Gateway (ID=2)
file = File.open("/Users/abdulhaseeb/Google Drive/Projects/RailsWorkSpace/MyBPM/app/models/Exclusive_choice_transition.xml", "rb")

contents = file.read

schema = File.open("/Users/abdulhaseeb/Google Drive/Projects/RailsWorkSpace/MyBPM/app/models/bpmnxpdl_31.xml", "rb")
contentsSchema = schema.read

## DEMO: This MOCK DATA file is for file (ID=2)
mockFile = File.open("/Users/abdulhaseeb/Google Drive/Projects/RailsWorkSpace/MyBPM/app/models/mock1.json", "rb")
mockDataContents = mockFile.read

sim = XpdlObject.new(contents, contentsSchema, mockDataContents)
#sim = XpdlObject.new(contents, contentsSchema, nil) # If no mock data file is passed in

sim.validate()

#puts sim.mockDataJSON
#if   sim.mockDataJSON.has_key?('whereToGo')
#  puts "it has key "
#end
#sim.mockDataJSON.each do |item|
#  #puts item
#  puts sim.mockDataJSON['whereToGo']
#end

rt = sim.start()
puts "\nStart Activity is: " + rt
#puts "Next Step Called, New Current Step is: " + ns_rt
#

# Loop Through The Next-Steps Until The Simulation Powers OFF...
while sim.power == "ON" do
  puts "Next Step Called, New Current Step is: " + sim.nextStep()
end


puts "\n-----------------------------------------\nSIMULATION LOG\n-----------------------------------------\n"
puts sim.simulationLog

puts ''
sim.resultJSON.each do |v|
  puts v
  puts ''
end


#obj.validate # Worker does not call validate, all validation takes place in .start()
#obj.traverse # Worker does not call traverse

# NOTE: THE WORKER CAN POLL @currActID DEPENDING ON HOW OFTEN THE CLIENT SIDE LOGIC WANTS TO UPDATE THE STATUS OF THE SIMULATION
# ALSO, CAN POLL THE TIMER INSTANCE VARIABLE

# WORKER(client) CAN ALSO call: 
# - XpdlObject.nextStep()
# - XpdlObject.start()
# - XpdlObject.terminate()
# - XpdlObject.currActID (poll getter)
# - XpdlObject.timer (poll getter)
# - XpdlObject.getDataFields() (poll method)
#
#
