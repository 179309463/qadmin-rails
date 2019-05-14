Rails.application.routes.draw do
  namespace :examples do
    get 'home'
    namespace :components do
      get 'layouts/headers'
    end
  end

  namespace :system do
    get 'account'
    get 'blacklist'
    get 'department'
    get 'error'
    get 'locked'
    get 'log_table'
    get 'login'
    get 'log'
    get 'maintenance'
    get 'menu'
    get 'message'
    get 'no_auth'
    get 'password'
    get 'settings_display'
    get 'settings_log'
    get 'site_map'
    get 'user'   
  end

  namespace :application do 
    get :vue
  end

  root "application#index"
end
