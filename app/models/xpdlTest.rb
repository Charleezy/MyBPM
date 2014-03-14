require './xpdl_object'

# THIS FILE WILL TURN INTO THE 'WORKER' PRETTY SOON :)

file = File.open("/Users/abdulhaseeb/Google Drive/Projects/RailsWorkSpace/MyBPM/app/models/workflow_pattern_simple.xml", "rb")
contents = file.read

schema = File.open("/Users/abdulhaseeb/Google Drive/Projects/RailsWorkSpace/MyBPM/app/models/bpmnxpdl_31.xml", "rb")
contentsSchema = schema.read


sim = XpdlObject.new(contents, contentsSchema, nil)


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
