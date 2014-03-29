require 'rubygems'
require 'json'

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
<<<<<<< HEAD
  # @mockDataHash -> holds the current set of updated data fields
  # to be written to resultJSON, at end of every step
  # @resultJSON -> holds the result simulation log in json format
  # to be returned to client after simulation is finished
  attr_accessor :currActID, :power, :mockDataJSON, :mockDataHash, :resultJSON
=======
  attr_accessor :currActID, :timer, :power, :mockDataJSON
>>>>>>> cd8492e1fbc76e8f6a0a63aacc7717396911bc77
  # @simulationLog holds the up-to-date log of the simulation
  attr_accessor :simulationLog 

  #######################################################################################################################

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
    @mockDataJSON = nil
<<<<<<< HEAD
    @mockDataHash = {}
    @resultJSON = {}
=======

>>>>>>> cd8492e1fbc76e8f6a0a63aacc7717396911bc77
  end

  #######################################################################################################################
  
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

    # Parse the mockDataFile and populate mockDataHash accordingly
    if (@mockDataFile != nil) # Currently only supporting 'STRING' dataTypes
      mock = JSON.parse(@mockDataFile)
<<<<<<< HEAD
      #mock = @mockDataFile
      #mock.each do |item|
      #end
      @mockDataJSON = {}
      #puts "mock before: " + mock
      mock['stages'].each{ |e| @mockDataJSON[e['stage_id']] = e['stage_data'] }
      p @mockDataJSON.inspect    
  
=======
      #mock.each do |item|
      #end
      @mockDataJSON = mock
>>>>>>> cd8492e1fbc76e8f6a0a63aacc7717396911bc77
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
  
  #######################################################################################################################
  
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

  #######################################################################################################################

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
<<<<<<< HEAD

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

    # Update @mockDataHash and @resultJSON
    update_resultJSON(@currActID)
    update_mockDataHash(@currActID)
=======

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
>>>>>>> cd8492e1fbc76e8f6a0a63aacc7717396911bc77

    # Return the Current Active ID: @currActID
    return @currActID

  end

  #######################################################################################################################

  # Next-Step Method
  # This method is called whenever DataField(s) values
  # are changed asynchronously, or any other event that 
  # triggers the simulation to move forward
  # Return: returns @currActID, if error returns 'ERROR' and terminates 
  # simulation (worker can check @simulationLog to see what
  # went wrong)
  def nextStep()

    @simulationLog = @simulationLog + "Entering XpdlObject.nextStep() ... \n"

    # Set of transitions found for this transition (If found more than 1,
    # then need to check the dataField var in MockData File)
    transFound = [] 

    # Find the Transitions tag
    transitions = @dom.find('//xpdl:Transition')
    transitions.each do |transition|
      if (transition.attributes['From'] == @currActID)
        #@currActID = transition.attributes['To']
        transFound.push(transition)
      end
    end
    

    # Check Size of transFound[]
    if transFound.length > 0
      otherwiseTrans = nil 
      conditionTrans = []
      normalTrans = nil # a transition without any <Condition tag

      # Parse through all transition objects, if one of them has an 'OTHERWISE' 
      # condition, then set it to 'otherwiseTrans' var, and pop it out of array
      transFound.each do |transition|
        conds = transition.find(".//xpdl:Condition")
        if conds.length != 0 # if a condition tag is found
          if conds[0].attributes['Type'] == "OTHERWISE"
            otherwiseTrans = transition
          elsif conds[0].attributes['Type'] == "CONDITION"
            puts "found a condition..."
            conditionTrans.push(transition)
          end
        else # No Condition for this transition (a normal transition)
          # Perform transition
          #performTrans(transition)
          normalTrans = transition
        end
      end # transFound.each

      # Perform transition now (parse through conditionTrans[], then do otherwiseTrans if necessary)

      if normalTrans != nil # if this is just a normal transition
        performTrans(normalTrans)
      else # if this transition has conditions
        transPerformed = 0 # Flag to determine if transition has been performed or not
        conditionTrans.each do |con|
          if evalCondition(con)
            performTrans(con) 
            transPerformed = 1
            break
          else
            if @power == "OFF"
              return "ERROR"
            end
          end
        end
        # Now check to see if a valid condition was found or not
        if transPerformed == 0 and otherwiseTrans != nil
          performTrans(otherwiseTrans)
          @simulationLog = @simulationLog + "NO CONDITION MATCHED: " + "Transitioning to 'OTHERWISE' Transition\n"
        elsif transPerformed == 0 and otherwiseTrans == nil
          @simulationLog = @simulationLog + "FATAL ERROR: Unable to find a valid Condition for transition for Activity ID: " + @currActID + "\n"
          puts "FATAL ERROR: Unable to find a valid Condition for transition for Activity ID: " + @currActID + "\n"
          self.terminate()  
          return "ERROR"
        end
      end # normalTrans != nil

    else # transFound.length > 0
      @simulationLog = @simulationLog + "FATAL ERROR: Unable to find a transition for Activity ID: " + @currActID + "\n"
      puts "FATAL ERROR: Unable to find a transition for Activity ID: " + @currActID + "\n"
      self.terminate()  
      return "ERROR"
    end 


    


    #############################################
    
    
    @simulationLog = @simulationLog + "Successfully Moved to the Next Step... \n"
    @simulationLog = @simulationLog + "@currActID is: " + @currActID + "\n"

    if self.isLastActivity(@currActID)
      @simulationLog = @simulationLog + "This is the Last Activity, The Simulation is Now Over :( ... POWERING OFF ... GoodBye  ^_^ \n"
<<<<<<< HEAD
      # Update @mockDataHash and @resultJSON
      update_resultJSON(@currActID)
      update_mockDataHash(@currActID)
=======
>>>>>>> cd8492e1fbc76e8f6a0a63aacc7717396911bc77
      self.terminate()
      return "ERROR"
    end

<<<<<<< HEAD
  # Update @mockDataHash and @resultJSON
  update_resultJSON(@currActID)
  update_mockDataHash(@currActID)

=======
>>>>>>> cd8492e1fbc76e8f6a0a63aacc7717396911bc77
  # Return the Current Active ID: @currActID
  return @currActID

  end

  #######################################################################################################################

  # This method evaluates a given Condition
  # Param: cond -> a condition tag object
  # Returns: 'true' if condition is satisfied,
  # 'false' otherwise
  def evalCondition(cond)
    conds = cond.find(".//xpdl:Condition")
    if conds.length != 0 # if a condition tag is found
      logic = conds[0].content  
      arr = logic.split("==")
      dataVar = arr[0]
      data = arr[1]
      data.gsub! /"/, '' # remove double quotes from value
      puts "dataVar is " + dataVar + " and data is " + data

      # Now check the @mockDataJSON for validation

<<<<<<< HEAD
      if @mockDataHash.has_key?(dataVar)
        if @mockDataHash[dataVar] == data
=======
      if @mockDataJSON.has_key?(dataVar)
        if @mockDataJSON[dataVar] == data
>>>>>>> cd8492e1fbc76e8f6a0a63aacc7717396911bc77
          @simulationLog = @simulationLog + "CONDITION MATCHED: " + logic + "\n"
          return true
        else
          return false
        end
      else # the mockDataFile does not have the required variable
        @simulationLog = @simulationLog + "FATAL ERROR: Mock Data File does not have the required variable: " + dataVar + " ...\n"
        self.terminate()
        return false
      end

    end
  end

  #######################################################################################################################
  #
  # This method performs a transition
  # Param: trans -> a transition tag object
  # The method sets the @currActID accordingly
  def performTrans(trans)
    @currActID = trans.attributes['To']
  end

  #######################################################################################################################
  
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

  #######################################################################################################################

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
    puts "Terminating the simulation ..."
    @simulationLog = @simulationLog + "Terminating the simulation ...\n"
  
    # Gracefully clean up any open/allocated resources....

  end


  ############ POLL METHODS ############

  # Worker can poll @currActID Getter and @timer Getter

  #######################################################################################################################

  # getDataFields Method
  # This method returns the current values of all of the
  # DataFields defined in the XPDL File/Model and mockDataFile
  # It returns a JSON parsed object (parsed from the @mockDataFile)
  def getDataFields()
    return @mockDataJSON
  end
<<<<<<< HEAD

  #######################################################################################################################

  # This method reads @mockDataJSON for the provided 'activity_id' 
  # parameter, and consolidates the new variables with the 
  # existing ones into the @mockDataHash. 
  # All the new vars are added to @mockDataHash, and repeated
  # ones have their values updated
  def update_mockDataHash(activity_id)

  if @mockDataJSON.has_key?(activity_id)
    puts "inside update_mockDataHash, has activity_id: " + activity_id
    @mockDataJSON[activity_id].each do |v|
      @mockDataHash[v["name"]] = v["value"]  
    end
  end

  end

  #######################################################################################################################

  # This method generates a new key/value in the @resultJSON
  # JSON object. It copies the up-to-date @simulationLog and 
  # @mockDataHash into the new key/value pair
  def update_resultJSON(activity_id)
  
    @resultJSON[activity_id] = {}
    @resultJSON[activity_id][:log] = @simulationLog
    #@simulationLog = ""
    
  
    @resultJSON[activity_id][:stage_data] = @mockDataHash
    
  end
=======
>>>>>>> cd8492e1fbc76e8f6a0a63aacc7717396911bc77

end







