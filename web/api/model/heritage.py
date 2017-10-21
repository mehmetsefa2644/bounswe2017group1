# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from profile import Profile

class Heritage(models.Model):
	title = models.CharField(max_length=50)
	description = models.TextField()
	creator = models.ForeignKey(Profile)
	creation_date = models.DateTimeField()
	event_date = models.DateTimeField()
	location = models.CharField(max_length=50)

	def __str__(self):
		return self.title
