'''
To run the code:
bokeh serve Interactive_Clustering_bokeh.py
python cluster.py -s viz results/home.xml

Server will be available at:
http://localhost:5006/Interactive_Clustering_bokeh

Sample data:
/data/infinity_ML_modeling/AppliedMLForDataExfilAndOtherFunTopics/nmap_cluster/results/home.xml
'''
__author__ = "xzhao"

from bokeh.io import curdoc
from bokeh.layouts import widgetbox, column, row
from bokeh.layouts import layout
from bokeh.models import ColumnDataSource
from bokeh.models.widgets import TextInput
from bokeh.models.widgets import RadioButtonGroup, Div, Button
from bokeh.plotting import figure
from Divisive_Cluster import Cluster
import numpy as np
from sklearn.decomposition import PCA
from bokeh.palettes import Spectral11
from bokeh.palettes import RdBu11
from bokeh.palettes import RdYlGn11
from bokeh.palettes import Greys8
import random
from bokeh.models import HoverTool
import clusteringnmap.interactive_state
from clusteringnmap.display import display_vector_index_details, display_shared_vector_indeces_details
from scipy.spatial.distance import pdist
from bokeh_util_distinct_color import *


def generate_color():
    import random
    colors = distinctColors(20)
    #print(colors)
    #colors = RdPu4 + Spectral5 + RdBu5 + RdYlGn5
    random.shuffle(colors)
    return colors

# todo Make the console have decision output


def rgb_to_hex(rgb):
    return '#%02x%02x%02x' % rgb


def generate_display_string(text, name="Cluster Commonality", height=300):
    return "<div class='bk-widget bk-layout-fixed' style='width: 500px;'><label>{1}</label><div class='bk-widget-form-input' style='height:{2}px; overflow:auto;'>{0}</div></div><br/>".format(text, name, height)


def set_cluster_statistics(cluster):
    display_string = ""

    display_string += "Number of IPs: {0}<br/>".format(len(cluster.index))

    vectors = []
    for index in cluster.index:
        vectors.append(clusteringnmap.interactive_state._reduced_vectors[index, :])
    distances = pdist(np.vstack(vectors))
    display_string += "Min Distance: {0}<br/>".format(distances.min())
    display_string += "Mean Distance: {0}<br/>".format(distances.mean())
    display_string += "Max Distance: {0}<br/>".format(distances.max())

    cluster_stats.text = generate_display_string(display_string, "Cluster Statistics", 100)


def select_next_cluster():
    cluster = _non_fixed_clusters[-1]
    set_cluster_statistics(cluster)
    size = np.ones(n_samples) * 15
    size[cluster.index] = 28
    alpha = np.ones(n_samples) * 0.6
    alpha[cluster.index] = 0.85
    cluster_commonality.text = generate_display_string(display_shared_vector_indeces_details(
        cluster.index,
        clusteringnmap.interactive_state._vectors,
        clusteringnmap.interactive_state._vector_names,
        clusteringnmap.interactive_state._vectorizer
    ).replace("\n", "<br/>"))

    source.data["size"] = size
    source.data["alpha"] = alpha


def update_labels():
    cluster_index = 0
    for cluster in _fixed_clusters:
        for index in cluster.index:
            clusteringnmap.interactive_state._labels[index] = cluster_index

        cluster_index += 1

    for cluster in _non_fixed_clusters:
        for index in cluster.index:
            clusteringnmap.interactive_state._labels[index] = cluster_index

        cluster_index += 1



def _fit_util(active):
    print("length of non fixed cluster is %d" % len(_non_fixed_clusters))
    text_input.value = ""
    if len(_non_fixed_clusters) <= 0:
        text_input.value = "Clustering is Done!"
        start_button.disabled = True
        source.data["color"] = plot_color
        source.data["size"] = np.ones(n_samples) * 15
        return

    if active == 2 and start_button.label == "Start":
        # initial state
        start_button.label = "Clustering"
        select_next_cluster()
        start_button.label = "Ready for Decision"
        start_button.disabled = True
    elif active == 1 and start_button.label != "Start":
        cluster = _non_fixed_clusters.pop()
        if len(cluster.data) <= min_pts:
            text_input.value = "# of points in the cluster <= 1, can't split"
            source.data["size"] = np.ones(n_samples) * 15
            _fixed_clusters.append(cluster)
            return

        text_input.value = "Cluster has been split"
        [cluster1, cluster2] = cluster.divide()
        if len(colors) == 0:
            colors.extend(Spectral11 + RdBu11 + RdYlGn11)
        plot_color[cluster1.index] = colors.pop()
        source.data["color"] = plot_color
        source.data["size"] = np.ones(n_samples) * 15
        for cluster in [cluster1, cluster2]:
            if len(cluster.data) == 1:
                _fixed_clusters.append(cluster)
            else:
                _non_fixed_clusters.append(cluster)

        update_labels()

        select_next_cluster()
    elif active == 0 and start_button.label != "Start":
        cluster = _non_fixed_clusters.pop()
        _fixed_clusters.append(cluster)
        text_input.value = "Cluster remains intact"
        source.data["color"] = plot_color
        source.data["size"] = np.ones(n_samples) * 15

        update_labels()

        select_next_cluster()

colors = generate_color()
min_pts = 1
_non_fixed_clusters = []
vectors = clusteringnmap.interactive_state._reduced_vectors
clusteringnmap.interactive_state._labels = np.zeros((vectors.shape[0],))
clusters = set()
_non_fixed_clusters.append(Cluster(vectors, range(vectors.shape[0])))
_fixed_clusters = []
filepath_array = []

vectors = np.matrix(vectors)
n_samples = vectors.shape[0]
pca = PCA(n_components=2)
transformed_vectors = pca.fit_transform(vectors)
plot_color = np.array(['#636363'] * n_samples)
markers = np.array(["circle"] * n_samples)
source = ColumnDataSource(
    dict(
        x=clusteringnmap.interactive_state._reduced_vectors[:, 0],
        y=clusteringnmap.interactive_state._reduced_vectors[:, 1],
        color=plot_color,
        size=np.ones(n_samples) * 15,
        marker=markers,
        alpha=np.ones(n_samples) * 0.6,
        ip=clusteringnmap.interactive_state._vector_names,
        features=[
            display_vector_index_details(
                index,
                clusteringnmap.interactive_state._vectors,
                clusteringnmap.interactive_state._vector_names,
                clusteringnmap.interactive_state._vectorizer
            ) for index in xrange(len(clusteringnmap.interactive_state._vector_names))
        ],
    )
)

# hover over tool, define what to display when hovering over a point
hover = HoverTool(
    tooltips="""
            <div style="font-size:10px;max-width: 640px; border-width:0; background:#2f2f2f; color:rgb(256,256,256); overflow-x: auto;">
            <div>
                <span style="font-size: 17px; font-weight: bold;">@ip</span>
                <span style="font-size: 15px; color: #966;">($x, $y)</span>
            </div>
            <div>
            <span><div id="feature-data-$index" style="display: none;">@features</div>
            <div id="output-features-$index"></div>
            <script>
            var fd = document.getElementById("feature-data-$index")
            var data = fd.innerText.split("\\n");
            var of = document.getElementById("output-features-$index");
            of.innerText = "";
            data.forEach(function(element, index, array){
                if(!element.startsWith("IP:")){
                    var p = document.createElement('DIV');
                    p.appendChild(document.createTextNode(element));
                    of.appendChild(p);
                }
            });
            </script>

            </div></span>
        </div>
    """,
)

# configure the scatter plot
TOOLS = [hover]
p = figure(title="", toolbar_location=None, tools=TOOLS, title_text_font_size='28pt', plot_width=1200, plot_height=1000)
p.grid.grid_line_color = Greys8[5]
p.outline_line_color = Greys8[5]
p.outline_line_width = 3
p.xaxis.axis_line_color = Greys8[5]
p.axis.major_tick_line_color = Greys8[5]
p.axis.minor_tick_line_color = Greys8[5]
p.axis.major_tick_in = 8
p.axis.major_tick_out = 0
p.axis.minor_tick_in = 8
p.axis.minor_tick_out = 0
p.axis.major_label_text_color = "#69D03C"
p.yaxis.axis_line_color = Greys8[5]
p.min_border = 80
p.background_fill_color = "black"
p.border_fill_color = "black"
p.scatter(x="x", y="y", source=source, color="color", size="size", marker="circle", alpha="alpha", hover_color='olive',
          hover_alpha=1.0)
p.outline_line_width = 1

# put the title there
source_title = ColumnDataSource(data=dict(text=["Interactive Clustering"], text_color=["#69D03C"]))
p_title = figure(toolbar_location=None, tools="lasso_select", plot_width=520, plot_height=200)
p_title.text(0, 0, text='text', text_color='text_color',
             alpha=0.6667, text_font_size='38pt', text_baseline='middle',
             text_align='center', source=source_title)
p_title.background_fill_color = "black"
p_title.border_fill_color = "black"
p_title.grid.grid_line_color = None
p_title.outline_line_color = None
p_title.axis.visible = None

# put Cylance Logo in
# p_logo = figure(toolbar_location=None, tools = "lasso_select", x_range=(0,1), y_range=(0,1), plot_width=520, plot_height=200)
# img = mpimg.imread("cylance_logo.png")
# p_logo.image_url(url=["cylance_logo.png"], x=0, y=0)
# p_logo.background_fill_color = "black"
# p_logo.border_fill_color = "black"
# p_logo.grid.grid_line_color = "black"
# p_logo.outline_line_color = "black"


# radio button group for uploading file
radio_group = RadioButtonGroup(labels=["NO-SPLIT", "SPLIT", "START"], button_type="success")
radio_group.width = 500
radio_group.on_click(_fit_util)

# text for console output
text_input = TextInput(value="", title="CONSOLE")
text_input.width = 500

cluster_stats = Div(
    render_as_text=False,
    text=generate_display_string("", name="Cluster Statistics", height=100)
)
cluster_stats.width = 500
cluster_stats.height = 100

cluster_commonality = Div(
    render_as_text=False,
    text=generate_display_string("")
)
cluster_commonality.width = 500
cluster_commonality.height = 300

split_button = Button(label="Split", button_type="success", width=150)
no_split_button = Button(label="Keep", button_type="success", width=150)
start_button = Button(label="Start", button_type="success", width=150)

split_button.on_click(lambda: _fit_util(1))
no_split_button.on_click(lambda: _fit_util(0))
start_button.on_click(lambda: _fit_util(2))

inputs = widgetbox(text_input, cluster_stats, cluster_commonality)

clusters = _fixed_clusters
l = layout(
    [
        [
            column(p_title, row(start_button, no_split_button, split_button), inputs),
            p
        ]
    ]
)
curdoc().add_root(l)
curdoc().title = "divisive"
