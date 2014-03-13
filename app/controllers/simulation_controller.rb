class SimulationController < ApplicationController
  
  layout "application"
  
  def index
    @mockdata = MockData.all
	@workflows = current_user.workflows
    @simulation_results = SimulationResult.all
  end
  
  def new
    @mockdata = MockData.new
  end
  
  def show
    @mockdata = MockData.find(params[:id])
  end
  
  def create
    @data = MockData.create(simulation_params)
    respond_to do |format| 
      format.html
      format.json { render :json => @data.id}
    end
  end
  
  def update
    @data = MockData.find(params[:id])
    @data.update(params[:mockdata].permit(:workflow_id, :mockdata))
    respond_to do |format| 
      format.html
      format.json { render :json => @data.id}
    end
  end
  
  def destroy
    @data = MockData.find(params[:id])
    @data.destroy
    respond_to do |format| 
      format.html
      format.json { render :json => @data.id}
    end
  end
  
  def simulation_params
    params.require(:mockdata).permit(:name, :workflow_id, :mockdata)
  end
  
end
