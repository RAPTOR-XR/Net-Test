from django.conf import settings
from django.urls import path
from django.conf.urls.static import static
from django.views.generic import RedirectView

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("ppost/<str:act>", views.ppost, name="ppost"),
    path("profile/<int:id>", views.profile, name="profile"),
    path("edit", views.edit, name="edit"),
    path("react/<str:act>/<int:actId>", views.react, name="react"),
    path("follow", views.follow, name="follow"),
    path("toggle_follow/<int:id>", views.toggle_follow, name="toggle_follow"),
    path(r'^favicon\.ico$',RedirectView.as_view(url='/static/images/favicon.ico')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
