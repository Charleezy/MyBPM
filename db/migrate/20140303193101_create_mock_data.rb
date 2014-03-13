class CreateMockData < ActiveRecord::Migration
  def change
    create_table :mock_data do |t|
	  t.string :name, :null => false
      t.references :workflow, index: true
      t.text :mockdata

      t.timestamps
    end
  end
end
