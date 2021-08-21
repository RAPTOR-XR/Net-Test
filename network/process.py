from django import forms
from django.contrib.admin import options
from django.core.exceptions import ValidationError
from django.forms import widgets
from flatpickr import DatePickerInput
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django_countries.widgets import CountrySelectWidget

from .models import UpPost, Comment, Profile

class ProcPost(forms.ModelForm):
    content = forms.CharField(label="Description", widget=forms.Textarea(attrs={'placeholder':_("What's on your mind?"),'autofocus':'autofocus','class':'form-control','aria-label':_("post content")}))
    class Meta:
        model = UpPost
        fields = ["content"]

class ProcComment(forms.ModelForm):
    content = forms.CharField(widget=forms.Textarea(attrs={'placeholder':_("Your comment..."),'line':'1','class':'form-control','aria-label':_("comment content")}))
    class Meta:
        model = Comment
        fields = ["content"]

class ProcProfile(forms.ModelForm):
    dob = forms.DateField(required=False, label=_("Date of birth: "), widget= DatePickerInput( options = {"altFormat": "d F Y", "altInput": True, "dateFormat": "yyyy-mm-dd"}, ))
    def mod_img(self):
        img = self.cleaned_data.get('img')
        if "default.png" not in img:
            if img.size > settings.MAX * 1024 * 1024:
                raise ValidationError(_(f"Image file exceeds {settings.MAX} MB size limit"))
            return img
    class Meta:
        model = Profile
        fields = ["name", "dob", "country", "img", "about"]
        labels = {"name":_("Name: "), "country":_("Country: "), "img":_("Image: "), "about":_("About: ")}
        widgets = {"name": forms.TextInput(attrs={"placeholder":_("Your name"), "aria-label":_("your name"), "class": "form-control"}),
        'country': CountrySelectWidget(attrs={"class": "form-control"}),
        "about": forms.Textarea(attrs={"placeholder":_("Describe yourself..."), "aria-label": _("describe yourself"), "class": "form-control"}),}