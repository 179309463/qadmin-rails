  class ApplicationController < ActionController::Base
    layout :set_layout

    def set_layout
        if params["pjax"] 
            "pjax"
        end
    end

    def index
        @type = "pjax"
        @theme = "base"
        @path = "/example/home"
        render 'examples/home', layout: "application"
    end

    def vue
        render layout: 'vue'
    end 

end