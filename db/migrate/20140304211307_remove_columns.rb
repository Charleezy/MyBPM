class RemoveColumns < ActiveRecord::Migration
  def change
    remove_column :workflows, :creation_date
    remove_column :workflows, :last_modified_date
    
  end
end
