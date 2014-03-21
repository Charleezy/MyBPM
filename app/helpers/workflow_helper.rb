require "active_support/core_ext/hash/conversions"
require 'json'

module WorkflowHelper
  
  def json_to_xpdl (my_json )
    {}.to_xml
    return JSON.parse(my_json).to_xml(:root => :my_root)
  end
  
  def xpdl_to_json xpdl
    xpdl
  end
end
