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
      if( current_user.workflows.create(workflow_params) )
        redirect_to :index, :notice => 'Workflow was created.'
      else 
        render :new, :notice => 'failed to create site.'
      end
    end

  private 

    def workflow_params
      params.require(:workflow).permit(:name, :xpdl)
    end
end
