class ApplicationController < ActionController::Base
  include Rails.application.routes.url_helpers

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :authenticate_user!
  before_action :setup_side_nav_links

  before_filter :configure_permitted_parameters, if: :devise_controller?

  def setup_side_nav_links
    @current_uri = request.env['PATH_INFO']
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:user_id, :first_name, :last_name, :email, :password, :password_confirmation) }
  end
end
