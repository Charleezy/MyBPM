require 'xmlsimple'

class WorkflowController < ApplicationController
  around_filter :exception_handler

  def index
    @workflows = 
      current_user.workflows.collect { |w| { :user => current_user.email, :workflow => w } }
  end

  def show
    @workflow = Workflow.find(params[:id])

  end

  def new
    @workflow = Workflow.new
  end

  def create
    workflow = current_user.workflows.create( workflow_params)
    if( workflow )
      render :text => workflow.id, :status => :created
    else 
      render :text => "Failed to save workflow", :status => :bad_request
    end
  end

  def update
    @workflow = Workflow.find( params[:workflow][:id].to_i)
    render :text => "Failed to find workflow", :status => :bad_request if @workflow.nil?

    @workflow.update_attributes(workflow_params)
    render :text => "Successfully updated workflow", :status => :created
  end

  def destroy
    @workflow = Workflow.find(params[:id])
    @workflow.destroy
    flash[:notice] = 'Workflow was deleted.'
    redirect_to :controller => 'workflow', :action => 'index'
  end

  # def import
  #   if( current_user.workflows.create( workflow_params) )
  #     render :json =>  Crack::XML.parse(params[:workflow][:xpdl]), :status => :created
  #   else
  #     render :nothing => true, :status => :bad_request
  #   end 
  # end

  def xpdltojson 
    myXML = XmlSimple.xml_in( "data/XML.txt", { 'AttrPrefix' => false, 'KeepRoot' => false, 'ForceArray' => true }) 
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
        redirect_to :action => 'index' 
      end 
    end

    def workflow_params
      params.require(:workflow).permit(:id, :name, :xpdl, :json)
    end
end
