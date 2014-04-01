class Worker 

    def self.schema_file
      prefix = Rails.root
      "#{prefix}/db/xpdl_schema/bpmnxpdl_31.xml"
    end

  def self.run(mock_data)

    # Simulation Result
    sr = SimulationResult.create({:workflow_id => mock_data.workflow_id, :status => 'PENDING...', :mock_data_id => mock_data.id})

    wf = Workflow.find(mock_data.workflow_id)
    mock_data_json = mock_data.mockdata

    

    sim = XpdlObject.new(wf.xpdl, File.read(self.schema_file) , mock_data_json)

    rt = sim.start()
    # Loop Through The Next-Steps Until The Simulation Powers OFF...
    while sim.power == "ON" do
      puts "Next Step Called, New Current Step is: " + sim.nextStep()
    end

    # Save the simulation results
    sr.step_trace = sim.resultJSON
    sr.status = 'FINISHED'
    sr.save()

  end

end
