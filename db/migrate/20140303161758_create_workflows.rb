class CreateWorkflows < ActiveRecord::Migration
  def change
    create_table :workflows do |t|
      t.references :user, index: true
      t.string :name, :null => false
      t.datetime :creation_date
      t.datetime :last_modified_date

      t.timestamps
    end
  end
end
