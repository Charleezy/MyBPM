class SimulationController < ApplicationController
    
  def index
    @workflows = current_user.workflows
    @workflow_ids = current_user.workflows.select("id")
    @mockdata = MockData.where(workflow_id: @workflow_ids)
  end

  def historical
    @workflow_ids = current_user.workflows.select("id")
    @simulation_results = SimulationResult.where(workflow_id: @workflow_ids)
    render 'historical'
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
      format.json { render :json => @data.id}
    end
  end
  
  def update
    @data = MockData.find(params[:id])
    @data.update(params[:mockdata].permit(:workflow_id, :mockdata))
    respond_to do |format| 
      format.html
      format.json { render :json => @data.id }
    end
  end
  
  def destroy
    @data = MockData.find(params[:id])
    @data.destroy
    respond_to do |format| 
      format.json { render :json => @data.id }
    end
  end
  
  def edit
    @simulation = MockData.find(params[:id])
    @workflow = Workflow.find(@simulation.workflow_id)
	@workflow.json = Crack::XML.parse(@workflow.xpdl)
  end
  
  def run
	@data = MockData.find(params[:id])
	Worker.run(@data)
	respond_to do |format| 
      format.json { render :json => @data.id }
    end
  end

  def simulation_params
    params.require(:mockdata).permit(:name, :workflow_id, :mockdata)
  end
  
  def setup_side_nav_links
    super
    @subnav_links = [
      {:text => "View all Simulations", :url => simulation_index_path},
      {:text => "View Simulation results", :url => '/simulation/historical'}
    ]
  end

end
