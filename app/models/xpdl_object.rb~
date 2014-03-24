class XpdlObject 

  # Instance variables
  # :file holds the raw XML XPDL file, :xsd holds the schema
  # @file and @xsd should be strings
  # @dom holds the Validated AND Parsed XPDL model
  # @mockDataFile holds the raw JSON Mock Data File (string) [could be nil,
  # if it is, then simulation proceeds w/o any Mock Data File, else it validates it
  attr_accessor :file, :xsd, :dom, :mockDataFile
  # @currActID (string) holds the current Activity ID of 
  # the simulation, @timer holds the current TimeStamp of the 
  # simulation (@timer is used to update the DataFields by
  # following the time sensitive DataField updates in the 
  # JSON @mockDataFile
  # @power (string) can only have 2 values: 'ON', 'OFF'
  # 'ON' -> simulation in progress, 'OFF' -> simulation not
  # in progress (all state vars are garbage)
  attr_accessor :currActID, :timer, :power   
  # @simulationLog holds the up-to-date log of the simulation
  attr_accessor :simulationLog 

  # Constructor Method
  # User must pass in XPDL file and Schema when instantiating a new object
  def initialize(file, xsd, mockDataFile)

    @file = file
    @xsd = xsd        

    # mockDataFile can be 'nil' or a string
    # If it is nil, then the simulation does not use any
    # mock data for the simulation. Otherwise it uses it,
    # and it must conform to the agreed upon format, else
    # simulation will not start
    @mockDataFile = mockDataFile

    @simulationLog = "XpdlObject constructor called successfully...\n"
    @power = 'OFF'
    @currActID = ''
    @timer = -1

  end

  
  # Validator Method
  # This method verifies the xml syntax of the XPDL file
  # and also validates the XPDL model based on the XSD schema
  def validate()
  
    @simulationLog = @simulationLog + "Entering XpdlObject.validate() method ... \n"

    # First let's validate the xml
    @simulationLog = @simulationLog + "Validating XPDL File Model against the schema... \n"

    #load the xml library
    require 'libxml'
    # load schema
    schema = LibXML::XML::Schema.from_string(@xsd)
    # load file
    document = LibXML::XML::Document.string(@file)

    # set error handler for libxml
    #validation_errors = Array.new
    #LibXML::XML::Error.set_handler{ |err| validation_errors << err }
    #LibXML::XML::Error.set_handler(&LibXML::XML::Error::QUIET_HANDLER)

    # validate the file against the schema
    begin
      result = document.validate_schema(schema) do |message,flag|
        puts message
      end
    rescue Exception => e  
      puts "File was not validated successfully :("
      puts e.message  
      @simulationLog = @simulationLog + "ERROR occured in XpdlObject.validate()...\n" + e.message + "\n"
      self.terminate()
      return false
    end
    #TO-DO: PREVENT LIBXML FROM RAISING FATAL-ERRORS
  

    # FUTURE-EXTENSION: TO ADD MORE STRICT VALIDATION RULES
    # ADD THEM HERE....

    # Validate @mockDataFile Format Here
    if (@mockDataFile != nil)
      # Validate Mock Data File Format
    end


    # If @file was validated successfully, then we use the
    # LibXML::XML::Parser to buld a DOM for further analysis of the 
    # XPDL object and simulation
    if result == true
      puts "File was validated successfully!"
      @simulationLog = @simulationLog + "XPDL File was validated successfully :) ... \n"
      source = LibXML::XML::Parser.string(@file) # source.class => LibXML::XML::Parser
      @dom = source.parse # content.class => LibXML::XML::Document
      return true
    else
      puts "File was not validated successfully :("
      return false
    end    

  end
  
  
  # getAllActivities Method
  # This method returns the set of <Activities> in the @file (XPDL)
  def getAllActivities()
   
    # Print all of the activities

    activities = @dom.find('//xpdl:Activity')
    return activities

=begin    
    activities.each do |activity|
      #puts "found something"
      puts activity.attributes['Id']
    end
=end

  end


  # Start Method
  # This method will 
  # Return: Upon Successful Start, it sets :currActID to the 
  # start Activity ID and returns: @currActID
  # Return: Upon fail/error it returns: 'ERROR' and terminates 
  # simulation (worker can check @simulationLog to see what
  # went wrong)
  def start()
     
    @simulationLog = @simulationLog + "Entering XpdlObject.start()... \n"    

    # CLEAN UP / RESET ANY RESOURCES/VARS..
    @power = 'OFF'
    @currActID = ''
    @timer = -1
     
    # Call the validate() method
    if !self.validate()    
      return 'ERROR'
    end

    # START TIMER
    # TO-DO ...

    # START SIMULATION :):):) YAAAYYYYYYYYY
    @simulationLog = @simulationLog + "Powering 'ON' The Simulation ... \n"
    @power = 'ON'    


    ####### SET @currActID ########
   
    activities = self.getAllActivities()
    startActivity = 'nil'
    activities.each do |activity|
      #puts "found an <Activity> ..."
      puts activity.attributes['Id']

      # Find the 'Start' Activity
      start_act = activity.find(".//xpdl:StartEvent")
      #puts "start_act size is " + start_act.length.to_s
      if start_act.length != 0
        #puts "Found StartEvent Activity: " + activity.attributes['Id']
        startActivity = activity.attributes['Id']
      end  
    end
    
    @currActID = startActivity
    
    @simulationLog = @simulationLog + "Simulation Started Successfully :) ... \n"
    @simulationLog = @simulationLog + "@currActID is: " + @currActID + "\n"

    # Return the Current Active ID: @currActID
    return @currActID

  end


  # Next-Step Method
  # This method is called whenever DataField(s) values
  # are changed asynchronously, or any other event that 
  # triggers the simulation to move forward
  # Return: returns @currActID, if error returns 'ERROR' and terminates 
  # simulation (worker can check @simulationLog to see what
  # went wrong)
  def nextStep()

    @simulationLog = @simulationLog + "Entering XpdlObject.nextStep() ... \n"
  
    # Find the Transitions tag
    transitions = @dom.find('//xpdl:Transition')
    transitions.each do |transition|
      if (transition.attributes['From'] == @currActID)
        @currActID = transition.attributes['To']
        break
      end
    end
    
    @simulationLog = @simulationLog + "Successfully Moved to the Next Step... \n"
    @simulationLog = @simulationLog + "@currActID is: " + @currActID + "\n"

    if self.isLastActivity(@currActID)
      @simulationLog = @simulationLog + "This is the Last Activity, The Simulation is Now Over :( ... POWERING OFF ... GoodBye  ^_^ \n"
      self.terminate()
    end

  # Return the Current Active ID: @currActID
  return @currActID

  end

  # Helper Method for nextStep()
  # Param: Takes as input an Activity ID
  # Returns 'true' if this ID is the last Activity,
  # 'false' otherwise
  def isLastActivity(id)
  
    activities = self.getAllActivities()

    activities.each do |activity|
      if activity.attributes['Id'] == id
        end_act = activity.find(".//xpdl:EndEvent")
        if end_act.length != 0
          return true
        end  
      end
    end

    return false

  end


  # Terminate Method
  # This method is called when the simulation reaches the end 
  # activity. It can also be called in the event of an unexpected
  # 'ERROR'. It can also be called directly by the Worker, in the 
  # event that the user wants to terminate the simulation midway.
  # This method MUST SET @power => 'OFF', and gracefully
  # terminate any outstanding file handlers, resources, etc... 
  def terminate()
  
    # Setting @power to 'OFF'
    @power = 'OFF'

    # Gracefully clean up any open/allocated resources....

  end


  ############ POLL METHODS ############

  # Worker can poll @currActID Getter and @timer Getter

  # getDataFields Method
  # This method returns the current values of all of the
  # DataFields defined in the XPDL File/Model and mockDataFile
  def getDataFields()
  end

end







