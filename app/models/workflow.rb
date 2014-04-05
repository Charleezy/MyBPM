require "xmlsimple"

class Workflow < ActiveRecord::Base
  belongs_to :user

  attr_accessor :xpdl, :json

  # Causes ActiveRecord to run this method
  # before saving (creating or updating).
  after_save :copy_to_file
  after_find :get_file


  def copy_to_file
    # Write data to the file.
    unless File.directory?(file_directory)
      FileUtils.mkdir_p(file_directory)
    end

    if !json.blank?

      tmp = JSON.parse(json)
      logger.fatal "THIS IS THE JSON COMING IN "
      logger.fatal tmp.inspect 
      logger.fatal tmp.class 


      xpdl = XmlSimple.xml_out tmp, {'RootName' => 'Package'}
    end
    File.open(file_name, 'w') { |file| file.write( xpdl ) }
  end

  def file_name
    file_directory + "#{id}"
  end

  def file_directory
    # Calculate and return the expected file name.
    prefix = Rails.root
    "#{prefix}/db/workflows/#{user_id}/"
  end

  def get_file
    logger.fatal "GETTING FILE"
    @xpdl = File.read( file_name )
    @json = XmlSimple.xml_in( file_name, { 'AttrPrefix' => false, 'KeepRoot' => false, 'ForceArray' => true }) if !@xpdl.blank?

    logger.fatal "HELLO this is the xml in a hash"
    logger.fatal @json.inspect
  end

end
