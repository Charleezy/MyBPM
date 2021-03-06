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
  end
  
  def run
    @data = MockData.find(params[:id])
    sr = Worker.run(@data)
    simulation_result = SimulationResult.find(sr)

    @results = eval(simulation_result.step_trace)

    last_activity_log = ""
    @results.each do |val|
      #puts "INSIDE SIMULATION CONTROLLER, @results: " + val.to_s + "\n"
      last_activity_log = val.to_s
    end

    puts "INSIDE SIMULATION CONTROLLER, last_activity_log: " + last_activity_log + "\n\n"
    last_activity_log = last_activity_log.gsub('\n', '<br/>')

    simulation_result.step_trace = last_activity_log
    simulation_result.save()

    render :text => last_activity_log

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
