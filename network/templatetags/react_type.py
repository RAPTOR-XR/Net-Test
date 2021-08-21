from django import template
from django.template.defaultfilters import register, stringfilter

from ..models import React

register = template.Library()
@register.simple_tag
def react_count(node, react_type):
    react_num = [emoji_tuple[0] for emoji_tuple in React.choices if emoji_tuple[1] == react_type][0]
    return node.reacts.filter(react_type=react_num).count()
@register.filter
@stringfilter
def till(value, delimiter=None):
    return value.split(delimiter)[0]
till.is_safe = True
