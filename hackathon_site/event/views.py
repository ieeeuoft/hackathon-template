from django.views.generic import TemplateView



class IndexView(TemplateView):
    template_name = "event/landing.html"



