#!/usr/bin/env python3

# Sanchaya.page build script

from collections import OrderedDict
from urllib.parse import urlparse
import shutil
import os
import yaml
from jinja2 import Template


def load_data(file):
	with open(file, "r") as f:
		out = yaml.safe_load(f.read())
		for item in out:
			item["languages"].sort()
			item["tags"].sort()
			url = item["url"]
			hostname = urlparse(url).hostname or ""
			item["url_pretty"] = url.removeprefix("https://").removeprefix("http://")
			item["is_cname"] = hostname.endswith(".sanchaya.net") or hostname == "sanchaya.net"
		return out


def get_tags(data):
	tags = {}
	for d in data:
		for t in d["tags"]:
			if t not in tags:
				tags[t] = 0
			tags[t] += 1
	return OrderedDict(sorted(tags.items()))


def get_categories(data):
	cat = {}
	for d in data:
		for c in d["categories"]:
			if c not in cat:
				cat[c] = 0
			cat[c] += 1
	return OrderedDict(sorted(cat.items()))


def get_languages(data):
	langs = {}
	for d in data:
		for l in d["languages"]:
			if l not in langs:
				langs[l] = 0
			langs[l] += 1
	return OrderedDict(sorted(langs.items()))


def filter_by_category(category, data):
	return sorted([d for d in data if category in d["categories"]], key=lambda k: k["name"].lower())


def load_template(file):
	with open(file, "r") as f:
		return Template(f.read())


def make_filename(file, out_dir):
	return "{}/{}.html".format(out_dir, file.lower())


def render_page(category, data, tpl, file):
	cats = get_categories(data)
	items = filter_by_category(category, data)
	list_langs = get_languages(items)
	list_tags = get_tags(items)

	html = tpl.render(categories=cats,
		category=category,
		list_languages=list_langs,
		list_tags=list_tags,
		list=items)

	with open(file, "w", encoding="utf-8") as f:
		f.write(html)


def render_all(data, tpl, out_dir):
	tags = get_tags(data)
	cat = get_categories(data)

	for c in cat:
		render_page(c, data, tpl, make_filename(c, out_dir))


if __name__ == "__main__":
	out_dir = "site"
	to_copy = ["static"]
	tpl_file = "template.html"
	data_file = "data.yml"

	if os.path.exists(out_dir):
		shutil.rmtree(out_dir)

	os.mkdir(out_dir)

	for f in to_copy:
		target = os.path.join(out_dir, f)
		if os.path.isfile(f):
			shutil.copyfile(f, target)
		else:
			shutil.copytree(f, target)

	tpl = load_template(tpl_file)
	data = load_data(data_file)

	render_all(data, tpl, out_dir)

	# Index page: show all projects sorted by name
	all_data = sorted(data, key=lambda k: k["name"].lower())
	cats = get_categories(data)
	all_langs = get_languages(all_data)
	all_tags = get_tags(all_data)

	html = tpl.render(categories=cats,
		category="All Projects",
		list_languages=all_langs,
		list_tags=all_tags,
		list=all_data)

	with open(make_filename("index", out_dir), "w", encoding="utf-8") as f:
		f.write(html)
