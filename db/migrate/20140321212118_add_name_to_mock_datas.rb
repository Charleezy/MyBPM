class AddNameToMockDatas < ActiveRecord::Migration
  def change
    add_column :mock_data, :name, :string
  end
end
