class Workflow < ActiveRecord::Base
  belongs_to :user

  attr_accessor :xpdl

  # Causes ActiveRecord to run this method
  # before saving (creating or updating).
  after_save :copy_to_file
  after_find :get_file

private

  def copy_to_file
    # Write data to the file.
    unless File.directory?(file_directory)
      FileUtils.mkdir_p(file_directory)
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
    @xpdl = File.read( file_name )
  end

end
