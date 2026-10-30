from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path('admin/', admin.site.urls),

    # Django API endpoints
    path('djangoapp/', include('djangoapp.urls')),

    # Existing static HTML pages
    path('', TemplateView.as_view(template_name='Home.html'), name='home'),
    path(
        'about/',
        TemplateView.as_view(
            template_name='About.html'),
        name='about'),

    path(
        'contact/',
        TemplateView.as_view(
            template_name='Contact.html'),
        name='contact'),

    # React authentication pages
    path(
        'login/',
        TemplateView.as_view(
            template_name='index.html'),
        name='login_page'),
    path(
        'register/',
        TemplateView.as_view(
            template_name='index.html'),
        name='register_page'),

    # React dealership pages
    path(
        'dealers',
        TemplateView.as_view(
            template_name='index.html'),
        name='dealers'),
    path('dealers/', TemplateView.as_view(template_name='index.html')),
    path(
        'dealer/<int:dealer_id>',
        TemplateView.as_view(
            template_name='index.html')),
    path(
        'dealer/<int:dealer_id>/',
        TemplateView.as_view(
            template_name='index.html')),
    path(
        'postreview/<int:dealer_id>',
        TemplateView.as_view(
            template_name='index.html')),
    path(
        'postreview/<int:dealer_id>/',
        TemplateView.as_view(
            template_name='index.html')),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
