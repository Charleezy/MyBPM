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
    File.open(file_name, 'w') { |file| file.write( xpdl ) }
  end

  def file_name
    # Calculate and return the expected file name.
    prefix = Rails.root
    "#{prefix}/db/workflows/#{user_id}/#{id}"
  end

  def get_file
    @xpdl = File.read( file_name )
  end

end
