require 'crack'
require 'json'

class WorkflowController < ApplicationController

	
	

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
        redirect_to :action => 'index', :notice => 'Workflow was created.'
      else 
        render :new, :notice => 'failed to create site.'
      end
    end

    def edit
      @workflow.find(params[:id])
    end

    def update
      @workflow = Workflow.find(params[:id])
      #TODO redirect to another page in the future
      redirect_to :back, :notice => 'error editing workflow' if @site.nil?
      @site.update_attributes(workflow_params)
    end

    def destroy
      @workflow = Workflow.find(params[:id])
      #TODO redirect to another page in the future
      redirect_to :back, :notice => 'error deleting workflow' and return if @workflow.nil?
      @workflow.destroy
      redirect_to :index, :notice => 'Workflow was deleted.'
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
	
	


	
  private 

    def workflow_params
      params.require(:workflow).permit(:name, :xpdl)
    end
end
