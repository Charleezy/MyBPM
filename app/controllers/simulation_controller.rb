class SimulationController < ApplicationController
  def index
	@mockdata = MockData.all
  end
  
  def new
	@mockdata = MockData.new
  end
  
  def create (workflow, data)
	@data = MockData.new(mockdata: data)
	@data.save
	
	redirect_to simulation_index_path
  end
  
  def destroy
	@data = MockData.find(params[:id])
	@data.destroy
	
	redirect_to simulation_index_path
  end
end
