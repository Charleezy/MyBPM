require 'crack'
require 'json'

class WorkflowController < ApplicationController
  around_filter :exception_handler
  include WorkflowHelper

  def index
    @workflows = current_user.workflows
  end

  def show
    @workflow = Workflow.find(params[:id])
    @workflow.json = xpdl_to_json(@workflow.xpdl)
  end

  def new
    @workflow = Workflow.new
  end

  def create
    params[:workflow][:xpdl] = json_to_xpdl(params[:workflow][:json])
    #Writes to database for [currentUserID][]
    if( current_user.workflows.create( workflow_params) )
      render :text => "success"
      #redirect_to :action => 'index', :notice => 'Workflow was created.'
    else 
      render :new, :notice => 'failed to create site.'
    end
  end

  def edit
    @workflow.find(params[:id])
    @workflow.json = xpdl_to_json(@workflow.xpdl)
  end

  def update
    params[:workflow][:xpdl] = json_to_xpdl(params[:workflow][:json])
    @workflow = Workflow.find(params[:id])
    #TODO redirect to another page in the future
    redirect_to :back, :notice => 'error editing workflow' if @site.nil?
    @workflow.update_attributes(workflow_params)
  end

  def destroy
    @workflow = Workflow.find(params[:id])
    @workflow.destroy
    flash[:notice] = 'Workflow was deleted.'
    redirect_to :controller => 'workflow', :action => 'index'
  end
end 
  
  #Should just use create as it does the same thing
  def import
    params[:workflow][:xpdl] = json_to_xpdl(params[:workflow][:json])
    #Writes to database for [currentUserID][]
    if( current_user.workflows.create( workflow_params) )
      render :text => "success"
      #redirect_to :action => 'index', :notice => 'Workflow was created.'
    else
    render :new, :notice => 'failed to import workflow.'
    end 
  end

  #given an ID of a workflow for the current user, returns the workflow as a json
  def export
    myXPDL = @workflow.find(params[:id]);
    myJSON = myXPDL.to_json;
    respond_to do |format| 
      format.json { render :json => myJSON}
    end
  end
  
  def xpdltojson 
    myXML = Crack::XML.parse(File.read("data/XML.txt"));
    myJSON = myXML.to_json;
    
    respond_to do |format| 
      format.json { render :json => myJSON};
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
