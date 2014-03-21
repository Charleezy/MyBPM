class HomeController < ApplicationController
  def index
  end

  def about
    render 'about'
  end

  def setup_side_nav_links
    super
    @subnav_links = [
      {:text => "Main", :url => '/'},
      {:text => "About", :url => '/about'}
    ]
  end
end