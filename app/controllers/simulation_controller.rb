class SimulationController < ApplicationController
  def index
	@mockdata = MockData.all
  end
  
  def new
	@mockdata = MockData.new
  end
  
  def create (workflowid, mockdata)
	@data = MockData.new(mockdata: data)
	@data.save
	
  end
  
  def destroy (workflowid)
	@data = MockData.find(params[:id])
	@data.destroy
	
	redirect_to simulation_index_path
  end
end
