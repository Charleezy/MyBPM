class CreateSimulationResults < ActiveRecord::Migration
  def change
    create_table :simulation_results do |t|
      t.references :workflow, index: true
      t.text :step_trace
      t.references :mock_data, index: true

      t.timestamps
    end
  end
end
