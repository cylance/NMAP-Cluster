import xml.etree.ElementTree as ET
from cStringIO import StringIO
from json import dumps


class NMAPXMLParser:
    def __init__(self):
        pass

    def can_parse_input(self, input_string):
        """
        Checks to see if the input is the kind we can parse
        :param input_string:
        :return: True if the input is NMAP XML
        """

        # super lazy method for now
        return input_string.startswith("<?xml") and "nmap.xsl" in input_string

    def parse_input(self, input_string):
        """
        Parse the NMAP XML input and dump out the list of strings representing out vectors
        :param input_string:
        :return:
        """
        # todo Maybe add script output?

        ip_addresses = {}

        tree = ET.parse(StringIO(input_string))
        root = tree.getroot()

        for e1 in root:
            if e1.tag == "host":
                host = e1

                ports = None
                address = None

                for e2 in host:
                    if e2.tag == "ports":
                        ports = e2
                    if e2.tag == "address" and e2.attrib['addrtype'] != "mac":
                        address = e2

                if ports is None:
                    continue

                ip_address = address.attrib['addr']
                if ip_address not in ip_addresses:
                    ip_addresses[ip_address] = []

                for port in ports:

                    if port.tag != "port":
                        continue

                    port_protocol = port.attrib["protocol"]
                    port_number = str(port.attrib['portid'])
                    port_state = port.find("state").attrib['state']

                    # lets only pay attention to open ports
                    if port_state in ["open"]:
                        s = dumps([port_protocol, port_number, port_state])

                        ip_addresses[ip_address].append(s)

                        service = port.find("service")

                        if "name" in service.attrib:
                            s = dumps([port_protocol, port_number, port_state, service.attrib["name"]])
                            ip_addresses[ip_address].append(s)

                            #s = dumps([port_protocol, port_state, service.attrib["name"]])
                            #ip_addresses[ip_address].append(s)

                            s_list = [port_protocol, port_number, port_state, service.attrib["name"]]
                            #s_no_port_list = [port_protocol, port_state, service.attrib["name"]]

                            for sid in ["product", "version", "extrainfo", "servicefp"]:
                                if sid in service.attrib:
                                    s_list.append(service.attrib[sid])
                                    s = dumps(s_list)
                                    ip_addresses[ip_address].append(s)

                                    #s_no_port_list.append(service.attrib[sid])
                                    #s = dumps(s_no_port_list)
                                    #ip_addresses[ip_address].append(s)

                            for script_element in port:
                                if script_element.tag != "script":
                                    continue
                                    # todo use generic parsing method to get script output
                                script_id = script_element.attrib["id"]

                                for table in script_element:
                                    if table.tag == "table":
                                        for elem in table:
                                            key = ""
                                            if "key" in elem.attrib:
                                                key = elem.attrib["key"]

                                            if elem.text is not None:
                                                s = dumps([port_protocol, port_number, port_state, service.attrib["name"],
                                                           script_id, key, elem.text])
                                            else:
                                                s = dumps(
                                                    [port_protocol, port_number, port_state, service.attrib["name"],
                                                     script_id, key])
                                            ip_addresses[ip_address].append(s)

                                    if table.tag == "elem":
                                        elem = table
                                        key = ""
                                        if "key" in elem.attrib:
                                            key = elem.attrib["key"]

                                        if elem.text is not None:
                                            s = dumps([port_protocol, port_number, port_state, service.attrib["name"],
                                                       script_id, key, elem.text])
                                        else:
                                            s = dumps(
                                                [port_protocol, port_number, port_state, service.attrib["name"],
                                                 script_id, key])
                                        ip_addresses[ip_address].append(s)


        return ip_addresses


parsers = [
    NMAPXMLParser()
]