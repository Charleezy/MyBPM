Mybpm::Application.routes.draw do
  
  devise_for :users
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root :to => "home#index"

  get '/simulation/historical', :controller => 'simulation', :action => 'historical'
  get '/simulation/run', :controller => 'simulation', :action => 'run'

  resources :workflow
  resources :simulation

  post '/workflow/import', :controller => 'workflow', :action => 'import'
  post '/workflow/xpdltojson', :controller => 'workflow', :action => 'xpdltojson'
  post '/workflow/create', :controller => 'workflow', :action => 'create'
  post '/workflow/update', :controller => 'workflow', :action => 'update'

  match '/about' => 'home#about', :as => :home, :via => :get
end
