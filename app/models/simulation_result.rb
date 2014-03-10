class SimulationResult < ActiveRecord::Base
  belongs_to :workflow
  belongs_to :mock_data
  serialize :step_trace, JSON

end
