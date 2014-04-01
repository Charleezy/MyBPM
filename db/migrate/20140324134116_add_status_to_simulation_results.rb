class AddStatusToSimulationResults < ActiveRecord::Migration
  def change
    add_column :simulation_results, :status, :string
  end
end
