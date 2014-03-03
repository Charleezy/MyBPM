class XpdlObject < ActiveRecord::Base

  # Instance variables
  # :file holds the raw XML XPDL file, :xsd holds the schema
  # @file and @xsd should be strings
  # @dom holds the Validated AND Parsed XPDL model
  attr_accessor :file, :xsd, :dom

  # Constructor Method
  # User must pass in XPDL file and Schema when instantiating a new object
  def initialize(file, xsd)
    @file = file
    @xsd = xsd        
  end

  
  # Validator Method
  # This method verifies the xml syntax of the XPDL file
  # and also validates the XPDL model based on the XSD schema
  def validate()

    # First let's validate the xml

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
    rescue 
      puts "caught: #{$!.to_s}"
    end
    #TO-DO: PREVENT LIBXML FROM RAISING FATAL-ERRORS
  

    # FUTURE-EXTENSION: TO ADD MORE STRICT VALIDATION RULES
    # ADD THEM HERE....


    # If @file was validated successfully, then we use the
    # LibXML::XML::Parser to buld a DOM for further analysis of the 
    # XPDL object and simulation
    if result == true
      puts "File was validated successfully!"
      source = LibXML::XML::Parser.string(@file) # source.class => LibXML::XML::Parser
      @dom = source.parse # content.class => LibXML::XML::Document
      return true
    else
      puts "File was not validated successfully :("
      return false
    end    

  end
  
  
  # Traverse Method
  # This method tarverses the 'Activities' of the XPDL
  # model.
  def traverse()
   
    # Print all of the activities

    activities = @dom.find('//xpdl:Activity')
    
    activities.each do |activity|
      #puts "found something"
      puts activity.attributes['Id']
    end



  end


end
