require 'crack'
require 'json'

class WorkflowController < ApplicationController
  around_filter :exception_handler

  def index
    @workflows = current_user.workflows
  end

  def show
    @workflow = Workflow.find(params[:id])
  end

  def new
    @workflow = Workflow.new
  end

  def create
    if( current_user.workflows.create( workflow_params) )
      # redirect_to :action => 'index', :notice => 'Workflow was created.'
      render :new, :notice => 'successfuly to create workflow.'
    else 
      render :new, :notice => 'failed to create workflow.'
    end
  end

  def edit
    @workflow = Workflow.find(params[:id])
  end

  def update
    @workflow = Workflow.find(params[:id])
    @workflow.update_attributes(workflow_params)
  end

  def destroy
    @workflow = Workflow.find(params[:id])
    @workflow.destroy
    flash[:notice] = 'Workflow was deleted.'
    redirect_to :controller => 'workflow', :action => 'index'
  end
  
  def import
  
  end
  
  def xpdltojson 
    myXML = Crack::XML.parse(File.read("data/XML.txt"));
    myJSON = myXML.to_json;
    
    respond_to do |format| 
      format.json { render :json => myJSON}
    end
  end
  
  def setup_side_nav_links
    super
    @subnav_links = [
      {:text => "View all workflows", :url => workflow_index_path},
      {:text => "Create a workflow", :url => new_workflow_path}
    ]
  end

  private 

    def exception_handler
      begin
        yield
      rescue ActiveRecord::RecordNotFound => e
        flash[:error] = 'No workflow found with that id'
        redirect_to :action => 'index' and return
      end 
    end

    def workflow_params
      params.require(:workflow).permit(:name, :xpdl)
    end
end
