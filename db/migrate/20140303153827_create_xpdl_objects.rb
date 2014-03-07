class CreateXpdlObjects < ActiveRecord::Migration
  def change
    create_table :xpdl_objects do |t|

      t.timestamps
    end
  end
end
